import { roomRepository, userRepository, IUser, gameRepository } from './db/db.js';
import { Game } from './db/games.js';
import { sendMsgsByWsID, wsSendUpdateRoom } from './messages/msgs.js';
import { ExtendedWebSocket } from './websocket-server.js'
// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws: ExtendedWebSocket, data: any, id: number) {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  if (isUserHaveRoom(currentUser.id)) return;

  const createdRoom = roomRepository.add(
    {
      roomUsers: [
        {
          name: currentUser.name,
          index: currentUser.id
        }
      ]
    });

  wsSendUpdateRoom(ws)
}

function isUserHaveRoom(userId: number) {
  const findIndex = roomRepository
    .getAll()
    .findIndex(room => room.roomUsers.some(user => userId === userId))
  if (findIndex === -1) return false
  return true
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

    sendMsgsByWsID(firstUser.wsId, responseToFirst);
  }
}
