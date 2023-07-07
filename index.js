import { httpServer } from "./src/http_server/index.js";
import { startWebSocketServer } from './src/back-ws/websocket-server.js';
import 'dotenv/config';

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const PORT_WS = process.env.PORT_WS || 3000;

startWebSocketServer(PORT_WS);
httpServer.listen(HTTP_PORT);
console.log(`Start static http server on the ${HTTP_PORT} port!`);
