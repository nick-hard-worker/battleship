import { wsServer } from '../../../index.js'
import { roomRepository } from '../db/rooms.js';
import { ExtendedWebSocket } from '../websocket-server.js';

export interface IMsg {
  type: string,
  data: string,
  id: number
}

export const enum ResType {
  reg = 'reg',
  updateRoom = 'update_room',
  updateWinners = 'update_winners',
  createGame = 'create_game',
  startGame = 'start_game',
  turn = 'turn',
  attack = 'attack'
}

export function formResponse(type: ResType, data: any): IMsg {
  return {
    type,
    data: JSON.stringify(data),
    id: 0
  }
}

export function sendMsgsByWsID(destinationWsIds: string[] | string | 'all', msg: IMsg) {
  if (typeof destinationWsIds === 'string' &&
    destinationWsIds !== 'all') { destinationWsIds = [destinationWsIds] }

  const allWsClients = [...wsServer.clients] as ExtendedWebSocket[];
  let responseList;
  if (destinationWsIds === 'all') { responseList = allWsClients }
  else {
    responseList = allWsClients.filter(client => destinationWsIds.includes(client.id));
  }

  const message = JSON.stringify(msg);
  responseList.forEach(client => client.send(message));
};

export function wsSendUpdateRoom(ws: ExtendedWebSocket) {
  const noFullRooms = roomRepository.getAll().filter(room => room.roomUsers.length < 2);
  const dataResponse = noFullRooms.map(room => { return { ...room, roomId: room.id } })

  console.log(dataResponse)

  const response = formResponse(ResType.updateRoom, dataResponse);
  ws.send(JSON.stringify(response));
}
