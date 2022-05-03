import { IBackendServer } from "./BackendServer";
import ProxyClient from "./websocket/ProxyClient";

export default class BackendClient extends ProxyClient<{}, IBackendServer> {
    static fnNames: (keyof IBackendServer)[] = ["getInfo", "ping"];
}
