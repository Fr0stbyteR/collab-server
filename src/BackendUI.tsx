import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Alert, Box, Grid, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import BackendClient from "./BackendClient";
import type { IServerInfo } from "./BackendServer";
import { msToTime } from "./utils";

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
                (globalThis as any).serverInfo = serverInfo;
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
            <Grid container spacing={1} direction="column" width="100%" padding="20px">
                <Grid container spacing={1} direction="row">
                    <Grid item xs={4}>
                        {isConnected
                            ? <Alert severity="success">{`Server up: ${msToTime(serverInfo?.upTime || 0)}`}</Alert>
                            : <Alert severity="warning">Not connected</Alert>
                        }
                    </Grid>
                    <Grid item xs={8}>
                        <Box component="form" sx={{ "& .MuiTextField-root": { m: 1 } }}>
                            <TextField multiline size="small" id="freq" label="Fetch Freq (ms)" type="number" value={fetchFreq} onChange={onChangeFreq} />
                            <TextField multiline size="small" type="password" label="Password" id="pass" value={pass} onChange={onChangePass} />
                        </Box>
                    </Grid>
                </Grid>
                {serverInfo
                    ? <Grid container direction="column">
                        {/*
                        <Grid item xs={12} sx={{ "&": { overflowWrap: "anywhere" } }}>
                            {JSON.stringify(serverInfo)}
                        </Grid>
                        */}
                        <DataGrid
                            autoHeight
                            density="compact"
                            rows={serverInfo.users}
                            columns={[
                                { field: "id", headerName: "ID", width: 300 },
                                { field: "nickname", headerName: "Nick name", width: 120 },
                                { field: "ping", headerName: "Ping", type: "number", width: 90 }
                            ]}
                        />
                        {serverInfo.rooms.map(room => (
                            <Grid key={room.id} container direction="row">
                                <DataGrid
                                    hideFooter
                                    autoHeight
                                    density="compact"
                                    rows={[{ id: room.id, permission: room.permission, owner: serverInfo.users.find(({ id }) => id === room.owner)?.nickname }]}
                                    columns={[
                                        { field: "id", headerName: "Room ID", width: 300 },
                                        { field: "permission", headerName: "Permission", width: 90 },
                                        { field: "owner", headerName: "Owner", width: 90 }
                                    ]}
                                />
                                <Grid container direction="row" minHeight="300px">
                                    <Grid item xs={6}>
                                        <DataGrid
                                            initialState={{ pagination: { pageSize: 5 } }}
                                            rowsPerPageOptions={[5, 10, 50, 100]}
                                            density="compact"
                                            rows={room.clients.map(clientId => serverInfo.users.find(({ id }) => id === clientId))}
                                            columns={[
                                                { field: "id", headerName: "ID", width: 300 },
                                                { field: "nickname", headerName: "Nick name", width: 120 },
                                                { field: "ping", headerName: "Ping", type: "number", width: 90 },
                                                { field: "timeOffset", headerName: "Time Offset", width: 90, valueFormatter: v => msToTime(+v) }
                                            ]}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <DataGrid
                                            initialState={{ pagination: { pageSize: 5 } }}
                                            rowsPerPageOptions={[5, 10, 50, 100]}
                                            density="compact"
                                            rows={room.project}
                                            getRowId={row => row.id}
                                            columns={[
                                                { field: "path", headerName: "Path", width: 150, valueFormatter: v => v.value.replace(/^\/project\//, "") || "." },
                                                { field: "size", headerName: "Size", type: "number", width: 90 },
                                                { field: "length", headerName: "Hist", type: "number", width: 90 },
                                                { field: "$", headerName: "Cur", type: "number", width: 90 },
                                                { field: "states", headerName: "States", type: "number", width: 90 }
                                            ]}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                        {/*
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Ping</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {serverInfo.users.map(user => (
                                        <TableRow
                                            key={user.id}
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">{user.id}</TableCell>
                                            <TableCell align="right">{user.ping}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        */}
                    </Grid>
                    : undefined
                }
                {errors ? <Grid item xs={12}><Alert severity="error">{errors}</Alert></Grid> : undefined}
            </Grid>
        </>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
