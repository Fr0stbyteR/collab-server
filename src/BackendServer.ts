import type CollaborationServer from "./CollaborationServer";
import ProxyServer from "./websocket/ProxyServer";

export interface IServerInfo {
    upTime: number;
    users: { id: string; nickname: string; ping: number }[];
    rooms: {
        id: string;
        clients: string[];
        owner: string;
        project: { id: string; path: string; size?: number; length?: number; $?: number }[];
        permission: "read" | "write";
    }[];
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
            nickname: this.liveShareServer.nicknames[id],
            ping: this.liveShareServer.pings[id]
        }));
        const rooms = Object.entries(this.liveShareServer.rooms).map(([id, room]) => ({
            id,
            clients: [...room.clients],
            owner: room.owner,
            project: Object.entries(room.project.items).map(([fileId, item]) => ({
                id: fileId,
                path: item.path,
                ...(item.isFolder === true ? {} : {
                    size: item.data.length,
                    ...room.getHistoryInfo(fileId)
                })
            })),
            permission: room.permission
        }));
        return { upTime, users, rooms };
    }
    ping(clientId: string, timestamp: number) {
        return timestamp;
    }
}
