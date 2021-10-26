import type { PromisifiedFunctionMap } from "@jspatcher/jspatcher/src/core/workers/Worker";
import type * as WebSocket from "ws";

export type PrependedFunction<F extends (...args: any[]) => any, A extends any[] = []> = (...args: [...A, ...Parameters<F>]) => ReturnType<F>;

export type PrependedFunctionMap<T, A extends any[] = []> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? PrependedFunction<T[K], A> : T[K];
};

export interface WebSocketLog {
    error?: boolean;
    msg: string;
    clientId: string;
}

export type ProxyServer<IClient extends {} = {}, IServer extends {} = {}> = PrependedFunctionMap<PromisifiedFunctionMap<IClient>, [WebSocket]> & IServer & { _handleLog?: (log: WebSocketLog) => any; _server: WebSocket.Server; _clients: Record<string, WebSocket>; _connect(): void };
export const ProxyServer: {
    port: number;
    fnNames: string[];
    timeout: number;
    prototype: ProxyServer;
    new <IClient extends {} = {}, IServer extends {} = {}>(): ProxyServer<IClient, IServer>;
};
