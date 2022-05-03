import type { ChangeEvent, LiveShareProject, RoomInfo } from "@jspatcher/jspatcher/src/core/LiveShareClient";
import CollaborationServer from "./CollaborationServer";
import { uuid } from "./utils";

export default class Room {
    readonly id = uuid();
    readonly server: CollaborationServer;
    readonly clients = new Set<string>();
    project: LiveShareProject;
    history: ChangeEvent[] = [];
    owner: string;
    permission: "read" | "write" = "read";
    constructor(owner: string, server: CollaborationServer, permission: "read" | "write", project: LiveShareProject) {
        this.owner = owner;
        this.server = server;
        this.permission = permission;
        this.project = project;
    }
    getInfo(clientId: string): RoomInfo {
        return {
            roomId: this.id,
            permission: this.permission,
            clients: Array.from(this.clients).map(id => ({
                username: this.server.usernames[id],
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
