import { WebSocketServer } from 'ws';
import { handleRegistration } from './reg-handler.js';

const messageHandlers = {
  reg: handleRegistration,
  create_room: () => { },
  add_user_to_room: () => { },
  add_ships: () => { },
  attack: () => { },
  randomAttack: () => { },
};

export const startWebSocketServer = (port) => {
  const wsServer = new WebSocketServer({ port });
  console.log(`WebSocket server started on the ${port}`);

  wsServer.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(msg) {
      try {
        const parsedMessage = JSON.parse(msg);
        console.log(parsedMessage);
        const { type, data, id } = parsedMessage;

        if (messageHandlers[type]) {
          messageHandlers[type](ws, data, id);
        } else {
          console.log(`No handler found for message type: ${type}`);
        }
      } catch (error) {
        console.error('Failed to parse incoming message:', error);
      }
    });
  });
};
