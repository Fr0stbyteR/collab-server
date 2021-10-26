import type { ILiveShareServer, ILiveShareClient, ChangeEvent, LiveShareProject } from "@jspatcher/jspatcher/src/core/LiveShareClient";
import Room from "./Room";
import ProxyServer from "./websocket/ProxyServer";
import type { WebSocketLog } from "./websocket/ProxyServer.types";

export interface ILiveShareServerPrepended {
    login(clientId: string, ...args: Parameters<ILiveShareServer["login"]>): ReturnType<ILiveShareServer["login"]>;
    hostRoom(clientId: string, ...args: Parameters<ILiveShareServer["hostRoom"]>): ReturnType<ILiveShareServer["hostRoom"]>;
    joinRoom(clientId: string, ...args: Parameters<ILiveShareServer["joinRoom"]>): ReturnType<ILiveShareServer["joinRoom"]>;
    closeRoom(clientId: string, ...args: Parameters<ILiveShareServer["closeRoom"]>): ReturnType<ILiveShareServer["closeRoom"]>;
    logout(clientId: string, ...args: Parameters<ILiveShareServer["logout"]>): ReturnType<ILiveShareServer["logout"]>;
    requestChanges(clientId: string, ...args: Parameters<ILiveShareServer["requestChanges"]>): ReturnType<ILiveShareServer["requestChanges"]>;
}

export default class CollaborationServer extends ProxyServer<ILiveShareClient, ILiveShareServerPrepended> {
    static port = 18010;
    static fnNames: (keyof ILiveShareClient)[] = ["ping", "roomClosedByOwner", "roomStateChanged", "changesFrom"];
    static timeout = 5000;
    readonly rooms: Record<string, Room> = {};
    readonly usernames: Record<string, string> = {};
    readonly pings: Record<string, number> = {};
    readonly timeOffset: Record<string, number> = {};
    constructor() {
        super();
        this._connect();
    }
    _handleLog = (log: WebSocketLog) => {
        const username = this.usernames[log.clientId];
        // eslint-disable-next-line no-console
        if (log.error) console.error(`[${username || "Server"}] \t${log.msg}`);
        // eslint-disable-next-line no-console
        else console.log(`[${username || "Server"}] \t${log.msg}`);
    };
    logout = (clientId: string) => {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room.owner === clientId) this.closeRoom(clientId, roomId);
            if (room.hasUser(clientId)) room.clients.delete(clientId);
        }
        delete this.usernames[clientId];
        delete this.pings[clientId];
        delete this.timeOffset[clientId];
        this._clients[clientId]?.close();
    };
    hearbeat = (clientId: string) => {
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
        const $reject = setTimeout(onrejected, CollaborationServer.timeout, new Error(`Hearbeat timeout for ${clientId}: ${this.usernames[clientId]}`));
        return $ping.then(onfulfilled).catch(onrejected);
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
    login(clientId: string, username: string, password: string, timestamp: number) {
        this.timeOffset[clientId] = Date.now() - timestamp;
        this.usernames[clientId] = username;
        this.hearbeat(clientId);
        return clientId;
    }
    hostRoom(clientId: string, timestamp: number, permission: "read" | "write", project: LiveShareProject) {
        const room = new Room(clientId, this, permission, project);
        this.rooms[room.id] = room;
        return { roomInfo: room.getInfo(clientId) };
    }
    joinRoom(clientId: string, timestamp: number, roomId: string) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        const socket = this._clients[clientId];
        const handleClose = () => {
            room.clients.delete(clientId);
            socket.removeEventListener("close", handleClose);
        };
        socket.removeEventListener("close", handleClose);
        socket.addEventListener("close", handleClose);
        room.clients.add(clientId);
        const roomInfo = room.getInfo(clientId);
        Array.from(room.clients).filter(id => id !== clientId).forEach((id) => {
            const socket = this._clients[id];
            if (socket) this.roomStateChanged(socket, roomInfo);
        });
        return { roomInfo, project: room.project, history: room.history };
    }
    closeRoom(clientId: string, roomId: string) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        if (clientId !== room.owner) throw new Error(`Client is not the owner of the room ${roomId}`);
        room.clients.forEach((clientId) => {
            if (this._clients[clientId]) this.roomClosedByOwner(this._clients[clientId], roomId);
        });
    }
    async requestChanges(clientId: string, roomId: string, ...events: ChangeEvent[]) {
        const room = this.rooms[roomId];
        if (!room) throw new Error(`No room ID: ${roomId}`);
        const timeOffset = this.timeOffset[clientId];
        if (typeof timeOffset !== "number") throw new Error(`User ${clientId}`);
        const username = this.usernames[clientId];
        if (typeof username !== "string") throw new Error(`No Username for ${clientId}`);
        const localEvents: ChangeEvent[] = events.map(e => ({ ...e, timestamp: e.timestamp + timeOffset }));
        let sendbackEvents: ChangeEvent[];
        let pushedEvents: ChangeEvent[];
        if (room.owner === clientId) {
            pushedEvents = room.pushEvents(clientId, ...localEvents);
            sendbackEvents = pushedEvents.map(e => ({ ...e, timestamp: e.timestamp - timeOffset }));
        } else {
            const { owner } = room;
            const ownerSocket = this._clients[owner];
            const ownerOffset = this.timeOffset[owner];
            const ownerEvents: ChangeEvent[] = localEvents.map(e => ({ ...e, timestamp: e.timestamp - ownerOffset }));
            const ownerDid = await this.changesFrom(ownerSocket, username, ...ownerEvents);
            const localDid: ChangeEvent[] = ownerDid.map(e => ({ ...e, timestamp: e.timestamp + ownerOffset }));
            pushedEvents = room.pushEvents(clientId, ...localDid);
            sendbackEvents = pushedEvents.map(e => ({ ...e, timestamp: e.timestamp - timeOffset }));
        }
        room.clients.forEach((id) => {
            if (id === clientId) return;
            if (id === room.owner) return;
            const socket = this._clients[id];
            if (!socket) return;
            const offset = this.timeOffset[id];
            if (typeof offset !== "number") return;
            const userEvents = pushedEvents.map(e => ({ ...e, timestamp: e.timestamp - offset }));
            this.changesFrom(socket, username, ...userEvents);
        });
        return sendbackEvents;
    }
}