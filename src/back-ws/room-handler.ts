import { roomRepository, userRepository, IUser, gameRepository } from './db/db.js';
import { Game } from './db/games.js';
import { ExtendedWebSocket, sendMsgsByWsID } from './websocket-server.js'
// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws: ExtendedWebSocket, data: any, id: number) {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  const createdRoom = roomRepository.add(
    {
      roomUsers: [
        {
          name: currentUser.name,
          index: currentUser.id
        }
      ]
    });

  wsSendUpdateRoom(ws, id)
}

export const addUserToRoom = (ws: ExtendedWebSocket, data: any, id: number) => {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  const roomForGame = roomRepository.getById(data.indexRoom);
  console.log(roomForGame);
  if (roomForGame && roomForGame.roomUsers.length === 1) {
    roomForGame.roomUsers.push({
      name: currentUser.name,
      index: currentUser.id
    })
    const firstUser = userRepository.getById(roomForGame.roomUsers[0].index) as IUser;

    roomRepository.update(roomForGame);
    let newGame = Game.initGame(firstUser.id, currentUser.id);
    gameRepository.add(newGame);

    const responseToCurrent = {
      type: "create_game",
      data: JSON.stringify({
        idGame: firstUser.id,
        idPlayer: currentUser.id
      }),
      id: 0,
    }
    ws.send(JSON.stringify(responseToCurrent))

    const responseToFirst = {
      type: "create_game",
      data: JSON.stringify({
        idGame: firstUser.id,
        idPlayer: firstUser.id
      }),
      id: 0,
    }

    sendMsgsByWsID(firstUser.wsId, JSON.stringify(responseToFirst));
  }
}

export function wsSendUpdateRoom(ws: ExtendedWebSocket, id: number) {
  const noFullRooms = roomRepository.getAll().filter(room => room.roomUsers.length < 2);

  const dataResponse = noFullRooms.map(room => { return { ...room, roomId: room.id } })
  const response = {
    type: 'update_room',
    data: JSON.stringify(dataResponse),
    id,
  };

  ws.send(JSON.stringify(response));
}
