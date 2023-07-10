import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { handleRegistration } from './reg-handler.js';
import { createRoom, addUserToRoom } from './room-handler.js';
import { wsServer } from '../../index.js'
import { addShips } from './ships-handler.js';
import { attack } from './attack-handler.js';

export interface ExtendedWebSocket extends WebSocket {
  id: string;
}

type IInputTypeMsg = 'reg' | 'create_room' | 'add_user_to_room' | 'add_ships' | 'attack' | 'randomAttack';
type MessageHandler = (ws: ExtendedWebSocket, data: any, id: number) => void;

const messageHandlers: Record<IInputTypeMsg, MessageHandler> = {
  reg: handleRegistration,
  create_room: createRoom,
  add_user_to_room: addUserToRoom,
  add_ships: addShips,
  attack: attack,
  randomAttack: attack,
};

export const startWebSocketServer = (port: number) => {
  const wsServer = new WebSocketServer({ port });
  console.log(`WebSocket server started on the ${port}`);

  wsServer.on('connection', (ws: ExtendedWebSocket) => {
    ws.id = randomUUID();
    ws.on('error', console.error);

    ws.on('message', function message(msg) {
      try {
        const parsedMessage = JSON.parse(msg.toString());
        let { type, data, id } = parsedMessage;
        console.log(parsedMessage);
        if (data.length > 0) data = JSON.parse(data); // feature on the frontend side

        if (isMessageHandler(type)) {
          messageHandlers[type](ws, data, id);
        } else {
          console.log(`No handler found for message type: ${type}`);
        }
      } catch (error) {
        console.error('Failed to parse incoming message:', error);
      }
    });
  });
  return wsServer;
};

function isMessageHandler(type: any): type is IInputTypeMsg {
  return type in messageHandlers;
}

export function sendMsgsByWsID(destinationWsIds: string[] | string, msg: string) {
  if (typeof destinationWsIds === 'string') { destinationWsIds = [destinationWsIds] }
  const allWsClients = [...wsServer.clients] as ExtendedWebSocket[];
  const responseList = allWsClients.filter(client => destinationWsIds.includes(client.id));
  responseList.forEach(client => client.send(msg))
};