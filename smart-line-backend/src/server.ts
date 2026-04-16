import app from './app';
import {initSocket} from "./config/socket";
import * as http from "node:http";

const PORT = 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});