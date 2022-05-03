import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Alert, Box, Container, Grid, TextField } from "@mui/material";
import BackendClient from "./BackendClient";
import type { IServerInfo } from "./BackendServer";

const client = new BackendClient();
client._serverUrl = "ws://localhost:18011";

const App = () => {
    const [fetchFreq, setFetchFreq] = React.useState(2000);
    const [isConnected, setConnected] = React.useState(false);
    const [serverInfo, setServerInfo] = React.useState<IServerInfo>(null as IServerInfo);
    const [errors, setErrors] = React.useState("");
    const [pass, setPass] = React.useState("JSPatch37");
    const onChangePass: React.ChangeEventHandler<HTMLInputElement> = e => setPass(e.target.value);
    const onChangeFreq: React.ChangeEventHandler<HTMLInputElement> = e => setFetchFreq(+e.target.value);
    React.useEffect(() => {
        const isOpen = client._socket?.readyState === WebSocket.OPEN;
        setConnected(isOpen);
        const handleOpen = () => setConnected(true);
        const handleClose = () => setConnected(false);
        // const handleError = (e: ErrorEvent) => setErrors(e.message);
        let $checkState: number = null;
        const checkState = async () => {
            try {
                if (!client._socket || client._socket?.readyState === WebSocket.CLOSED || client._socket?.readyState === WebSocket.CLOSING) {
                    const $con = client._connect();
                    client._socket.addEventListener("open", handleOpen);
                    // client._socket.addEventListener("error", handleError);
                    client._socket.addEventListener("close", handleClose);
                    await $con;
                }
                setErrors("");
                const serverInfo = await client.getInfo(pass);
                setServerInfo(serverInfo);
            } catch (error) {
                setErrors(error.message);
            }
            $checkState = window.setTimeout(checkState, 2000);
        };
        checkState();
        return () => {
            client._socket?.removeEventListener("open", handleOpen);
            // client._socket?.removeEventListener("error", handleError);
            client._socket?.removeEventListener("close", handleClose);
            window.clearTimeout($checkState);
        };
    }, []);
    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={4}>
                    {isConnected ? <Alert severity="success">Connected</Alert> : <Alert severity="warning">Not connected</Alert>}
                </Grid>
                <Grid item xs={8}>
                    <Box component="form" sx={{ "& .MuiTextField-root": { m: 1 } }}>
                        <TextField multiline size="small" id="freq" label="Fetch Freq (ms)" type="number" value={fetchFreq} onChange={onChangeFreq} />
                        <TextField multiline size="small" type="password" label="Password" id="pass" value={pass} onChange={onChangePass} />
                    </Box>
                </Grid>
                {serverInfo
                    ? <Grid item xs={12}>
                        <div>{JSON.stringify(serverInfo)}</div>
                    </Grid>
                    : undefined
                }
                {errors ? <Grid item xs={12}><Alert severity="error">{errors}</Alert></Grid> : undefined}
            </Grid>
        </>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
