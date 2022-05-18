import * as WebSocket from "ws";
import * as BSON from "bson";
import type { WebSocketRequest, WebSocketResponse } from "@jspatcher/jspatcher/src/core/websocket/ProxyClient.types";
import type { ProxyServer, WebSocketLog } from "./ProxyServer.types";
import { uuid } from "../utils";
import TimeoutError from "./TimeoutError";

const Server = class ProxyServer {
    static port: number;
    static fnNames: string[] = [];
    static timeout = 5000;
    _server: WebSocket.Server;
    _clients: Record<string, WebSocket> = {};
    _handleLog?: (log: WebSocketLog) => any;
    _timestamp: number;
    _connect() {
        const Ctor = (this.constructor as typeof ProxyServer);
        const socketMap = new Map<WebSocket, string>();
        const resolves: Record<string, ((...args: any[]) => any)> = {};
        const rejects: Record<string, ((...args: any[]) => any)> = {};
        const handleConnection = (client: WebSocket) => {
            const clientId = uuid();
            this._clients[clientId] = client;
            socketMap.set(client, clientId);
            const handleOpen = (e: { target: WebSocket }) => {
                e.target.addEventListener("message", handleMessage);
                e.target.addEventListener("error", handleError);
                e.target.addEventListener("close", handleClose);
            };
            const handleError = (e: { error: any; message: any; target: WebSocket }) => {
                // eslint-disable-next-line no-console
                console.error(e.error);
            };
            const handleClose = (e: { wasClean: boolean; code: number; reason: string; target: WebSocket }) => {
                e.target.removeEventListener("message", handleMessage);
                e.target.removeEventListener("error", handleError);
                e.target.removeEventListener("close", handleClose);
                e.target.removeEventListener("open", handleOpen);
                delete this._clients[clientId];
                socketMap.delete(client);
                if (!e.wasClean) {
                    this._handleLog?.({ error: true, clientId, msg: `Error from \t[${clientId}]: WebSocket closed: ${e.code} - ${e.reason}` });
                    // eslint-disable-next-line no-console
                    console.error(`WebSocket closed: ${e.code} - ${e.reason}`);
                }
            };
            const handleMessage = async (e: WebSocket.MessageEvent) => {
                const { target, data } = e;
                this._handleLog?.({ clientId, msg: `Received from \t[${clientId}]: \t${"".padEnd(20, " ")}\t${(data as ArrayBuffer).byteLength} bytes` });
                const { id, call, args, value, error } = BSON.deserialize(data as ArrayBuffer, { promoteBuffers: true }) as WebSocketResponse & WebSocketRequest;
                if (call) {
                    const r: WebSocketResponse = { id };
                    try {
                        r.value = await (this as any)[call](clientId, ...args);
                    } catch (e) {
                        r.error = e.message;
                        this._handleLog?.({ clientId, msg: `Err to \t[${clientId}]: \t${call.padEnd(20, " ")}\t${e.message}` });
                    }
                    const data = BSON.serialize(r);
                    this._handleLog?.({ clientId, msg: `Return to \t[${clientId}]: \t${call.padEnd(20, " ")}\t${data.byteLength} bytes` });
                    target.send(data);
                } else {
                    if (error) this._handleLog?.({ clientId, msg: `Err from \t[${clientId}]: \t${error}` }); // rejects[id]?.(new Error(error));
                    else resolves[id]?.(value);
                    delete resolves[id];
                    delete rejects[id];
                }
            };
            handleOpen({ target: client });
            this._handleLog?.({ clientId, msg: `Connect from \t[${clientId}]` });
        };
        // eslint-disable-next-line arrow-body-style
        const call = (client: WebSocket, call: string, ...args: any[]) => {
            return new Promise<any>((resolve, reject) => {
                const id = uuid();
                resolves[id] = (arg: any) => {
                    clearTimeout($timeout);
                    resolve(arg);
                };
                rejects[id] = reject;
                const data = BSON.serialize({ id, call, args });
                const clientId = socketMap.get(client);
                this._handleLog?.({ clientId, msg: `Send to \t[${clientId}]: \t${call.padEnd(20, " ")}\t${data.byteLength} bytes` });
                client.send(data);
                const $timeout = setTimeout(() => {
                    delete resolves[id];
                    delete rejects[id];
                    this._handleLog?.({ clientId, error: true, msg: `Err Return to \t[${clientId}]: \t${call.padEnd(20, " ")}\tTimeout: ${Ctor.timeout}ms.` });
                    // reject(new TimeoutError(`Socket Response Timeout: ${Ctor.timeout}ms.`));
                }, Ctor.timeout);
            });
        };
        this._handleLog?.({ clientId: "", msg: `Initializing server on ${Ctor.port}` });
        const server = new WebSocket.WebSocketServer({ port: Ctor.port });
        this._handleLog?.({ clientId: "", msg: `Server on ws://localhost:${Ctor.port}` });
        Ctor.fnNames.forEach(name => (this as any)[name] = (client: WebSocket, ...args: any[]) => call(client, name, ...args));
        server.addListener("connection", handleConnection);
        this._timestamp = Date.now();
    }
} as typeof ProxyServer;

export default Server;
