import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { handleRegistration } from './request-handlers/reg-handler.js';
import { createRoom, addUserToRoom } from './request-handlers/room-handler.js';
import { addShips } from './request-handlers/ships-handler.js';
import { attack } from './request-handlers/attack-handler.js';
import { wsServer } from '../../index.js';
import { gameRepository, roomRepository, userRepository } from './db/db.js';

export interface ExtendedWebSocket extends WebSocket {
  id: string;
  isAlive: boolean;
  heartbeat(ws: WebSocket): void;
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
    ws.heartbeat = function (this: ExtendedWebSocket) {
      this.isAlive = true;
    }
    ws.id = randomUUID();
    ws.isAlive = true;
    ws.on('pong', ws.heartbeat);
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

    ws.on('close', () => {
      console.log(`client terminated ${ws.id}`)
      const disconnectedUser = userRepository.getByWsId(ws.id);

      // delete existing rooms with user
      const rooms = roomRepository
        .getAll()
        .filter(room => room.roomUsers.some(user => user.index === disconnectedUser?.id));
      console.log(rooms);
      rooms.forEach(room => roomRepository.delete(room.id as number));
      console.log(roomRepository.getAll());

      // delete existing games with user
      const games = gameRepository
        .getAll()
        .filter(game => game.players.some(user => user.userId === disconnectedUser?.id));
      console.log(games);
      games.forEach(game => gameRepository.delete(game.id as number));
      console.log(gameRepository.getAll());
    });
  });
  return wsServer;


};

function isMessageHandler(type: any): type is IInputTypeMsg {
  return type in messageHandlers;
}
