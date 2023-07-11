import { roomRepository, userRepository, IUser, gameRepository } from './db/db.js';
import { Game } from './db/games.js';
import { ResType, formResponse, sendMsgsByWsID, wsSendUpdateRoom } from './messages/msgs.js';
import { ExtendedWebSocket } from './websocket-server.js'
// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws: ExtendedWebSocket, data: any, id: number) {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  if (isUserHaveRoom(currentUser.id)) return;

  roomRepository.add(
    {
      roomUsers: [
        {
          name: currentUser.name,
          index: currentUser.id
        }
      ]
    });

  wsSendUpdateRoom()
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

    const dataToCurrentUser = {
      idGame: firstUser.id,
      idPlayer: currentUser.id
    }
    const responseToCurrent = formResponse(ResType.createGame, dataToCurrentUser);
    ws.send(JSON.stringify(responseToCurrent))

    const dataToFirst = {
      idGame: firstUser.id,
      idPlayer: firstUser.id
    }
    const responseToFirst = formResponse(ResType.createGame, dataToFirst)
    sendMsgsByWsID(firstUser.wsId, responseToFirst);

    roomRepository.delete(data.indexRoom);
  }
}
