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
                nickname: this.server.nicknames[id],
                ping: this.server.pings[id],
                isOwner: id === this.owner,
                selection: {},
                cursor: null
            })),
            userIsOwner: clientId === this.owner
        };
    }
    hasUser(clientId: string) {
        return this.clients.has(clientId);
    }
    pushEvents(clientId: string, ...events: ChangeEvent[]) {
        this.history.push(...events);
        return events;
    }
}
