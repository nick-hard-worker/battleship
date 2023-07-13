import { userRepository, IUser } from '../db/models/users.js';
import { IRoom, roomRepository } from '../db/models/rooms.js';
import { Game, gameRepository } from '../db/models/games.js';
import { ResType, formResponse, sendMsgsByWsID, wsSendUpdateRoom } from '../responses/msgs.js';
import { ExtendedWebSocket } from '../websocket-server.js'

// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws: ExtendedWebSocket, data: any, id: number) {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  console.log(currentUser);
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
    .findIndex(room => room.roomUsers.some(user => user.index === userId))
  if (findIndex === -1) return false
  return true
}

export const addUserToRoom = (ws: ExtendedWebSocket, data: any, id: number) => {
  const currentUser = userRepository.getByWsId(ws.id) as IUser;
  const roomForGame = roomRepository.getById(data.indexRoom) as IRoom;

  // try to connect to self room:
  if (roomForGame && roomForGame.roomUsers[0].index === currentUser.id) return;

  // room already full
  if (roomForGame && roomForGame.roomUsers.length === 2) return

  roomForGame.roomUsers.push({
    name: currentUser.name,
    index: currentUser.id
  })

  const firstUser = userRepository.getById(roomForGame.roomUsers[0].index) as IUser;

  // roomRepository.update(roomForGame);
  const newGame = Game.initGame(firstUser.id, currentUser.id);
  gameRepository.add(newGame);

  const dataToCurrentUser = {
    idGame: newGame.gameId,
    idPlayer: currentUser.id
  }
  const responseToCurrent = formResponse(ResType.createGame, dataToCurrentUser);
  sendMsgsByWsID(ws.id, responseToCurrent);

  const dataToFirst = {
    idGame: newGame.gameId,
    idPlayer: firstUser.id
  }
  const responseToFirst = formResponse(ResType.createGame, dataToFirst)
  sendMsgsByWsID(firstUser.wsId, responseToFirst);

  roomRepository.delete(data.indexRoom);
}

