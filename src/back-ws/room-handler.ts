import { roomRepository, userRepository, IUser, gameRepository } from './db/db.js';
import { ExtendedWebSocket, sendMsgToMultiple } from './websocket-server.js'
// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws: ExtendedWebSocket, data: any, id: number) {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  const createdRoom = roomRepository.create(
    {
      roomUsers: [
        {
          name: currentUser.name,
          index: currentUser.id
        }
      ]
    });
  const noFullRooms = roomRepository.getAll().filter(room => room.roomUsers.length < 2);

  const dataResponse = noFullRooms.map(room => { return { ...room, roomId: room.id } })
  const response = {
    type: 'update_room',
    data: JSON.stringify(dataResponse),
    id,
  };

  ws.send(JSON.stringify(response));
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
    gameRepository.create({
      gameId: firstUser.id,
      players: [
        {
          userId: firstUser.id,
          ships: []
        },
        {
          userId: currentUser.id,
          ships: []
        }
      ]
    });

    const response = {
      type: "create_game",
      data: JSON.stringify({
        idGame: firstUser.id,
        idPlayer: currentUser.id
      }),
      id: 0,
    }

    sendMsgToMultiple([firstUser.wsId, currentUser.wsId,], JSON.stringify(response));
  }
}
