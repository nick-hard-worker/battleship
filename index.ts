import { httpServer } from "./src/http_server/index.js";
import { ExtendedWebSocket, startWebSocketServer } from './src/back-ws/websocket-server.js';
import 'dotenv/config';

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const PORT_WS = process.env.PORT_WS || 3000;

export const wsServer = startWebSocketServer(+PORT_WS);
httpServer.listen(+HTTP_PORT);
console.log(`Start static http server on the ${HTTP_PORT} port!`);

const interval = setInterval(function ping() {
  wsServer.clients.forEach(function each(ws) {
    const wsExt = ws as ExtendedWebSocket;
    if (wsExt.isAlive === false) return wsExt.terminate();

    wsExt.isAlive = false;
    wsExt.ping();
  });
}, 10000);

wsServer.on('close', function close() {
  clearInterval(interval);
});
