import type { ChangeEvent, LiveShareProject, RoomInfo } from "@jspatcher/jspatcher/src/core/LiveShareClient";
import CollaborationServer from "./CollaborationServer";

export default class Room {
    readonly id: string;
    readonly password: string;
    readonly server: CollaborationServer;
    readonly clients = new Set<string>();
    project: LiveShareProject;
    history: ChangeEvent[] = [];
    owner: string;
    permission: "read" | "write" = "read";
    constructor(owner: string, id: string, password: string, server: CollaborationServer, permission: "read" | "write", project: LiveShareProject) {
        this.id = id;
        this.password = password;
        this.owner = owner;
        this.server = server;
        this.permission = permission;
        this.project = project;
        this.clients.add(owner);
    }
    getInfo(clientId: string): RoomInfo {
        return {
            roomId: this.id,
            permission: this.permission,
            clients: Array.from(this.clients).map(id => ({
                clientId: id,
                nickname: this.server.nicknames[id],
                ping: this.server.pings[id],
                isOwner: id === this.owner,
                selection: {},
                cursor: null
            })),
            userIsOwner: clientId === this.owner
        };
    }
    pushEvents(clientId: string, ...events: ChangeEvent[]) {
        this.history.push(...events);
        return events;
    }
    getHistoryInfo(fileId: string) {
        const history = this.project.history[fileId];
        if (!history) return null;
        const { $, eventQueue } = history;
        return { $, length: eventQueue.length };
    }
    transferOwnership(clientId: string, toClientId: string): RoomInfo {
        if (this.owner !== clientId) throw new Error(`Room is not owned by: ${clientId}`);
        if (!this.clients.has(clientId)) throw new Error(`Room does not have client: ${clientId}`);
        this.owner = toClientId;
        return this.getInfo(clientId);
    }
}
