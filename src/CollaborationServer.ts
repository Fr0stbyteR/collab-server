import type { IHistoryEvent } from "@jspatcher/jspatcher/src/core/file/History";
import type { ILiveShareServer, ILiveShareClient, LiveShareProject, RoomInfo } from "@jspatcher/jspatcher/src/core/LiveShareClient";
import Room from "./Room";
import ProxyServer from "./websocket/ProxyServer";
import type { WebSocketLog } from "./websocket/ProxyServer.types";

export interface ILiveShareServerPrepended {
    pingServer(clientId: string, ...args: Parameters<ILiveShareServer["pingServer"]>): ReturnType<ILiveShareServer["pingServer"]>;
    reportPing(clientId: string, ...args: Parameters<ILiveShareServer["reportPing"]>): ReturnType<ILiveShareServer["reportPing"]>;
    login(clientId: string, ...args: Parameters<ILiveShareServer["login"]>): ReturnType<ILiveShareServer["login"]>;
    logout(clientId: string, ...args: Parameters<ILiveShareServer["logout"]>): ReturnType<ILiveShareServer["logout"]>;
    hostRoom(clientId: string, ...args: Parameters<ILiveShareServer["hostRoom"]>): ReturnType<ILiveShareServer["hostRoom"]>;
    transferOwnership(clientId: string, ...args: Parameters<ILiveShareServer["transferOwnership"]>): ReturnType<ILiveShareServer["transferOwnership"]>;
    joinRoom(clientId: string, ...args: Parameters<ILiveShareServer["joinRoom"]>): ReturnType<ILiveShareServer["joinRoom"]>;
    closeRoom(clientId: string, ...args: Parameters<ILiveShareServer["closeRoom"]>): ReturnType<ILiveShareServer["closeRoom"]>;
    requestChanges(clientId: string, ...args: Parameters<ILiveShareServer["requestChanges"]>): ReturnType<ILiveShareServer["requestChanges"]>;
    updateState(clientId: string, ...args: Parameters<ILiveShareServer["updateState"]>): ReturnType<ILiveShareServer["updateState"]>;
}

export default class CollaborationServer extends ProxyServer<ILiveShareClient, ILiveShareServerPrepended> {
    static port = 18010;
    static fnNames: (keyof ILiveShareClient)[] = ["ping", "roomClosedByOwner", "roomStateChanged", "changesFrom", "stateUpdateFrom"];
    static timeout = 5000;
    readonly rooms: Record<string, Room> = {};
    readonly nicknames: Record<string, string> = {};
    readonly pings: Record<string, number> = {};
    readonly timeOffset: Record<string, number> = {};
    _handleLog = (log: WebSocketLog) => {
        const username = this.nicknames[log.clientId];
        // eslint-disable-next-line no-console
        if (log.error) console.error(`[${username || "Server"}] \t${log.msg}`);
        // eslint-disable-next-line no-console
        else console.log(`[${username || "Server"}] \t${log.msg}`);
    };
    logout = (clientId: string) => {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room.clients.has(clientId)) this.leaveRoom(clientId, roomId);
        }
        delete this.nicknames[clientId];
        delete this.pings[clientId];
        delete this.timeOffset[clientId];
        setImmediate(() => this._clients[clientId]?.close());
    };
    hearbeat = async (clientId: string) => {
        const now = Date.now();
        const $ping = this.ping(this._clients[clientId], now, this.getRoomInfoOfClient(clientId));
        let rejected = false;
        const onfulfilled = () => {
            if (rejected) return;
            const ping = Date.now() - now;
            this.pings[clientId] = ping;
            clearTimeout($reject);
            setTimeout(this.hearbeat, CollaborationServer.timeout, clientId);
        };
        const onrejected = (reason: any) => {
            rejected = true;
            this.logout(clientId);
            console.error(reason);
        };
        const $reject = setTimeout(onrejected, CollaborationServer.timeout, new Error(`Hearbeat timeout for ${clientId}: ${this.nicknames[clientId]}`));
        try {
            await $ping;
            return onfulfilled();
        } catch (reason) {
            return onrejected(reason);
        }
    };
    pullRoomState = (roomId: string, clientId: string) => {
        const room = this.rooms[roomId];
        if (!room) {
            console.error(`No room ID: ${roomId}`);
            return;
        }
        const socket = this._clients[clientId];
        if (!socket) {
            console.error(`No user ID: ${clientId}`);
            return;
        }
        this.roomStateChanged(socket, room.getInfo(clientId));
    };
    whichRoom(clientId: string) {
        for (const roomId in this.rooms) {
            if (this.rooms[roomId].clients.has(clientId)) return roomId;
        }
        return null;
    }
    getRoomInfoOfClient(clientId: string) {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room.clients.has(clientId)) {
                return room.getInfo(clientId);
            }
        }
        return null;
    }
    pingServer(clientId: string, timestamp: number) {
        return Date.now();
    }
    reportPing(clientId: string, ping: number) {
        this.pings[clientId] = ping;
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room.clients.has(clientId)) return room.getPings();
        }
        return {};
    }
    login(clientId: string, timestamp: number, nickname: string, username: string, password: string) {
        this.timeOffset[clientId] = Date.now() - timestamp;
        this.nicknames[clientId] = nickname;
        const socket = this._clients[clientId];
        const handleClose = () => {
            this.logout(clientId);
            socket.removeEventListener("close", handleClose);
        };
        socket.removeEventListener("close", handleClose);
        socket.addEventListener("close", handleClose);
        // this.hearbeat(clientId);
        return clientId;
    }
    hostRoom(clientId: string, roomId: string, password: string, timestamp: number, permission: "read" | "write", project: LiveShareProject, currentProjectHash: string) {
        if (this.rooms[roomId]) throw Error("Room ID already exist.");
        const room = new Room(clientId, roomId, password, this, permission, project, currentProjectHash);
        this.rooms[room.id] = room;
        return { roomInfo: room.getInfo(clientId) };
    }
    leaveRoom(clientId: string, roomId: string) {
        const room = this.rooms[roomId];
        if (!room) return;
        if (!room.clients.has(clientId)) return;
        if (room.owner === clientId) {
            if (room.clients.size >= 2) {
                this.transferOwnership(clientId, roomId, room.clients.values().next().value);
                room.clients.delete(clientId);
                room.clients.forEach((id) => {
                    if (id === clientId) return;
                    const socket = this._clients[id];
                    if (socket) this.roomStateChanged(socket, room.getInfo(id));
                });
            } else {
                this.closeRoom(clientId, roomId);
            }
        } else {
            room.clients.delete(clientId);
            room.clients.forEach((id) => {
                if (id === clientId) return;
                const socket = this._clients[id];
                if (socket) this.roomStateChanged(socket, room.getInfo(id));
            });
        }
    }
    transferOwnership(clientId: string, roomId: string, toClientId: string): RoomInfo {
        const room = this.rooms[roomId];
        if (!room) throw Error(`No room ID: ${roomId}`);
        if (!room.clients.has(clientId)) throw Error(`User not in room ID: ${roomId}`);
        const roomInfo = room.transferOwnership(clientId, toClientId);
        room.clients.forEach((id) => {
            const socket = this._clients[id];
            if (socket) this.roomStateChanged(socket, room.getInfo(id));
        });
        return roomInfo;
    }
    joinRoom(clientId: string, roomId: string, username: string, password: string, timestamp: number, currentProjectHash: string) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        if (password !== room.password) throw new Error("Room password incorrect.");
        room.clients.add(clientId);
        const roomInfo = room.getInfo(clientId);
        room.clients.forEach((id) => {
            if (id === clientId) return;
            const socket = this._clients[id];
            if (socket) this.roomStateChanged(socket, room.getInfo(id));
        });
        const resp = { roomInfo, project: { ...room.project } };
        if (currentProjectHash && currentProjectHash === room.projectHash) delete resp.project.items;
        return resp;
    }
    closeRoom(clientId: string, roomId: string) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        if (clientId !== room.owner) throw new Error(`Client is not the owner of the room ${roomId}`);
        room.clients.forEach((clientId) => {
            const socket = this._clients[clientId];
            if (socket) this.roomClosedByOwner(socket, roomId);
        });
        delete this.rooms[roomId];
    }
    async requestChanges(clientId: string, roomId: string, ...events: IHistoryEvent[]) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        if (room.owner !== clientId && room.permission !== "write") throw new Error(`User ${clientId} doesn't have write permission`);
        const timeOffset = this.timeOffset[clientId];
        if (typeof timeOffset !== "number") throw new Error(`User ${clientId} doesn't have a timeOffset`);
        const username = this.nicknames[clientId];
        if (typeof username !== "string") throw new Error(`No Username for ${clientId}`);
        const localEvents: IHistoryEvent[] = events.map(e => ({ ...e, timestamp: e.timestamp + timeOffset }));
        const { merged, unmerged } = room.pushEvents(localEvents);
        const sendbackEvents = unmerged.map(e => ({ ...e, timestamp: e.timestamp - timeOffset }));
        room.clients.forEach((id) => {
            if (id === clientId) return;
            const socket = this._clients[id];
            if (!socket) return;
            const offset = this.timeOffset[id];
            if (typeof offset !== "number") return;
            const userEvents = merged.map(e => ({ ...e, timestamp: e.timestamp - offset }));
            this.changesFrom(socket, username, ...userEvents);
        });
        return sendbackEvents;
    }
    updateState(clientId: string, roomId: string, timestamp: number, state: Record<string, Record<string, any>>) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        const timeOffset = this.timeOffset[clientId];
        if (typeof timeOffset !== "number") throw new Error(`User ${clientId} doesn't have a timeOffset`);
        const username = this.nicknames[clientId];
        if (typeof username !== "string") throw new Error(`No Username for ${clientId}`);
        const t = timestamp + timeOffset;
        if (t < room.objectStateTimestamp) return;
        room.updateState(t, state);
        room.clients.forEach((id) => {
            if (id === clientId) return;
            const socket = this._clients[id];
            if (!socket) return;
            this.stateUpdateFrom(socket, username, state);
        });
    }
}
