import BackendServer from "./BackendServer";
import CollaborationServer from "./CollaborationServer";

const server = new CollaborationServer();
server._connect();
(globalThis as any).server = server;

const backend = new BackendServer();
backend.liveShareServer = server;
backend._connect();
(globalThis as any).backend = backend;
