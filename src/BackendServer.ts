import type { IHistoryEvent } from "@jspatcher/jspatcher/src/core/file/History";
import type CollaborationServer from "./CollaborationServer";
import ProxyServer from "./websocket/ProxyServer";

export interface IServerInfo {
    upTime: number;
    users: { id: string; username: string; ping: number }[];
    rooms: { id: string; clients: string[]; owner: string; project: string[]; permission: "read" | "write"; history: IHistoryEvent<any>[] }[];
}

export interface IBackendServer {
    getInfo(secret: string): IServerInfo;
    ping(timestamp: number): number;
}

export interface IBackendServerPrepended {
    getInfo(clientId: string, ...args: Parameters<IBackendServer["getInfo"]>): ReturnType<IBackendServer["getInfo"]>;
    ping(clientId: string, ...args: Parameters<IBackendServer["ping"]>): ReturnType<IBackendServer["ping"]>;
}

export default class BackendServer extends ProxyServer<{}, IBackendServerPrepended> {
    static port = 18011;
    liveShareServer: CollaborationServer;
    secret = "JSPatch37";
    getInfo(clientId: string, secret: string): IServerInfo {
        if (this.secret !== secret) return null;
        if (!this.liveShareServer) return null;
        const upTime = Date.now() - this.liveShareServer._timestamp;
        const users = Object.keys(this.liveShareServer._clients).map(id => ({
            id,
            username: this.liveShareServer.usernames[id],
            ping: this.liveShareServer.pings[id]
        }));
        const rooms = Object.entries(this.liveShareServer.rooms).map(([id, room]) => ({
            id,
            clients: [...room.clients],
            owner: room.owner,
            project: Object.values(room.project.items).map(item => item.path),
            permission: room.permission,
            history: room.history.map(event => ({ ...event, eventData: null }))
        }));
        return { upTime, users, rooms };
    }
    ping(clientId: string, timestamp: number) {
        return timestamp;
    }
}
