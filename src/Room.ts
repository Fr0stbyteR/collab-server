import type { IHistoryEvent } from "@jspatcher/jspatcher/src/core/file/History";
import type { LiveShareProject, RoomInfo } from "@jspatcher/jspatcher/src/core/LiveShareClient";
import CollaborationServer from "./CollaborationServer";

export default class Room {
    readonly id: string;
    readonly password: string;
    readonly server: CollaborationServer;
    readonly clients = new Set<string>();
    project: LiveShareProject;
    owner: string;
    permission: "read" | "write" = "read";
    objectStateTimestamp = Date.now();
    projectHash: string;
    constructor(owner: string, id: string, password: string, server: CollaborationServer, permission: "read" | "write", project: LiveShareProject, projectHash: string) {
        this.id = id;
        this.password = password;
        this.owner = owner;
        this.server = server;
        this.permission = permission;
        this.project = project;
        this.projectHash = projectHash;
        const ownerTimeOffset = +this.server.timeOffset[owner];
        for (const fileId in this.project.history) {
            const history = this.project.history[fileId];
            history.forEach(e => e.timestamp += ownerTimeOffset);
        }
        this.objectStateTimestamp = Date.now();
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
            ownerId: this.owner
        };
    }
    getPings() {
        const pings: Record<string, number> = {};
        for (const clientId of this.clients) {
            pings[clientId] = this.server.pings[clientId];
        }
        return pings;
    }
    pushEvents(events: IHistoryEvent[]) {
        const merged: IHistoryEvent[] = [];
        const unmerged: IHistoryEvent[] = [];
        for (const event of events) {
            const { fileId } = event;
            if (!(fileId in this.project.history)) {
                this.project.history[fileId] = [event];
                merged.push(event);
            } else {
                const history = this.project.history[fileId];
                const eventsToMerge = events.filter(e => e.fileId === fileId).sort((a, b) => a.timestamp - b.timestamp);
                if (!eventsToMerge.length) continue;
                if (history.length && history[history.length - 1].timestamp > eventsToMerge[0].timestamp) {
                    unmerged.push(...eventsToMerge);
                    continue;
                }
                merged.push(...eventsToMerge);
                history.push(...eventsToMerge);
            }
        }
        return { unmerged, merged };
    }
    getHistoryInfo(fileId: string) {
        const history = this.project.history[fileId];
        if (!history) return null;
        const { length } = history;
        if (!length) return { $: -1, length };
        const $ = history[length - 1].nextHistoryIndex;
        return { $, length };
    }
    transferOwnership(clientId: string, toClientId: string): RoomInfo {
        if (this.owner !== clientId) throw new Error(`Room is not owned by: ${clientId}`);
        if (!this.clients.has(clientId)) throw new Error(`Room does not have client: ${clientId}`);
        this.owner = toClientId;
        return this.getInfo(clientId);
    }
    updateState(timestamp: number, state: Record<string, Record<string, any>>) {
        for (const fileId in state) {
            if (!this.project.objectState[fileId]) this.project.objectState[fileId] = state[fileId];
            else Object.assign(this.project.objectState[fileId], state[fileId]);
        }
        this.objectStateTimestamp = timestamp;
    }
}
