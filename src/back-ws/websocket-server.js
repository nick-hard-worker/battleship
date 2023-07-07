import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { handleRegistration } from './reg-handler.js';
import { createRoom } from './room-handler.js';

const messageHandlers = {
  reg: handleRegistration,
  create_room: createRoom,
  add_user_to_room: () => { },
  add_ships: () => { },
  attack: () => { },
  randomAttack: () => { },
};

export const startWebSocketServer = (port) => {
  const wsServer = new WebSocketServer({ port });
  console.log(`WebSocket server started on the ${port}`);

  wsServer.on('connection', ws => {
    // console.log('Clients: ', wsServer.clients.size);
    ws.id = randomUUID();
    ws.on('error', console.error);

    ws.on('message', function message(msg) {
      try {
        const parsedMessage = JSON.parse(msg);
        console.log(parsedMessage);
        let { type, data, id } = parsedMessage;

        if (data.length > 0) data = JSON.parse(data); // feature on the frontend side

        if (messageHandlers[type] && id === 0) {
          messageHandlers[type](ws, data);
        } else {
          console.log(`No handler found for message type: ${type}`);
        }
      } catch (error) {
        console.error('Failed to parse incoming message:', error);
      }
    });
  });
};
