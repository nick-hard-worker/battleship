import { WebSocketServer } from 'ws';

export const startWebSocketServer = (port) => {
  const wsServer = new WebSocketServer({ port });
  console.log(`WebSocket server started on the ${port}`);

  wsServer.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
      const msg = data.toString();
      console.log(msg);
    });

    // ws.send('something');
  });
};
