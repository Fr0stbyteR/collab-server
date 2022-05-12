import BackendServer from "./BackendServer";
import CollaborationServer from "./CollaborationServer";

const server = new CollaborationServer();
server._connect();
(global as any).server = server;

const backend = new BackendServer();
backend.liveShareServer = server;
backend._connect();
(global as any).backend = backend;
