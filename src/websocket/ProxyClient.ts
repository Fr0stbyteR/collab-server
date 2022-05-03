import * as BSON from "bson";
import TypedEventEmitter from "@shren/typed-event-emitter";
import type { TypedMessageEvent } from "@jspatcher/jspatcher/src/core/workers/Worker";
import type { ProxyClient, WebSocketResponse, WebSocketRequest, WebSocketLog } from "./ProxyClient.types";
import { uuid } from "../utils";
import TimeoutError from "./TimeoutError";

const Client = class ProxyClient extends TypedEventEmitter<any> {
    static fnNames: string[] = [];
    static timeout = 5000;
    _serverUrl: string;
    _socket: WebSocket;
    _handleLog?: (log: WebSocketLog) => any;
    _connect() {
        if (this._socket && this._socket?.readyState !== WebSocket.CLOSED) this._socket.close();
        const Ctor = (this.constructor as typeof ProxyClient);
        const resolves: Record<string, ((...args: any[]) => any)> = {};
        const rejects: Record<string, ((...args: any[]) => any)> = {};
        return new Promise<void>((resolve, reject) => {
            const handleOpen = () => {
                resolve();
                socket.removeEventListener("open", handleOpen);
                socket.removeEventListener("error", handleError);
                socket.addEventListener("message", handleMessage);
                socket.addEventListener("close", handleClose);
            };
            const handleClose = (e: CloseEvent) => {
                socket.removeEventListener("open", handleOpen);
                socket.removeEventListener("error", handleError);
                socket.removeEventListener("message", handleMessage);
                socket.removeEventListener("close", handleClose);
                if (!e.wasClean) {
                    this._handleLog?.({ error: true, msg: `Error: WebSocket closed: ${e.code} - ${e.reason}` });
                    throw new Error(`WebSocket closed: ${e.code} - ${e.reason}`);
                }
            };
            const handleError = (e: ErrorEvent) => {
                socket.removeEventListener("open", handleOpen);
                socket.removeEventListener("error", handleError);
                reject(new Error(`WebSocket connect to '${this._serverUrl}' failed.`));
            };
            const handleMessage = async (e: TypedMessageEvent<Blob>) => {
                const data = await e.data.arrayBuffer();
                this._handleLog?.({ msg: `Received: \t${data.byteLength} bytes` });
                const { id, call, args, value, error } = BSON.deserialize(data, { promoteBuffers: true }) as WebSocketResponse & WebSocketRequest;
                if (call) {
                    const r: WebSocketResponse = { id };
                    try {
                        r.value = await (this as any)[call](...args);
                    } catch (e) {
                        r.error = e;
                    }
                    const data = BSON.serialize(r);
                    this._handleLog?.({ msg: `Send: \t${call}\t${data.byteLength} bytes` });
                    socket.send(data);
                } else {
                    if (error) rejects[id]?.(error);
                    else resolves[id]?.(value);
                    delete resolves[id];
                    delete rejects[id];
                }
            };
            // eslint-disable-next-line arrow-body-style
            const call = (call: string, ...args: any[]) => {
                return new Promise<any>((resolve, reject) => {
                    const id = uuid();
                    resolves[id] = (arg: any) => {
                        clearTimeout($timeout);
                        resolve(arg);
                    };
                    rejects[id] = reject;
                    const data = BSON.serialize({ id, call, args });
                    this._handleLog?.({ msg: `Send: \t${data.byteLength} bytes` });
                    socket.send(data);
                    const $timeout = setTimeout(() => {
                        delete resolves[id];
                        delete rejects[id];
                        this._handleLog?.({ error: true, msg: `Socket Response Timeout: ${Ctor.timeout}ms.` });
                        reject(new TimeoutError(`Socket Response Timeout: ${Ctor.timeout}ms.`));
                    }, Ctor.timeout);
                });
            };
            this._handleLog?.({ msg: `Initializing client on ${this._serverUrl}` });
            let socket: WebSocket;
            try {
                socket = new WebSocket(this._serverUrl);
                this._handleLog?.({ msg: `Client connecting on ${this._serverUrl}` });
            } catch (error) {
                this._handleLog?.({ error: true, msg: `Error on Initializing client on ${this._serverUrl}: ${(error as Error).message}` });
                reject(error);
            }
            Ctor.fnNames.forEach(name => (this as any)[name] = (...args: any[]) => call(name, ...args));
            socket.addEventListener("open", handleOpen);
            socket.addEventListener("error", handleError);
            this._socket = socket;
        });
    }
    _disconnect() {
        if (this._socket && this._socket?.readyState !== WebSocket.CLOSED) this._socket.close();
    }
} as typeof ProxyClient;

export default Client;
