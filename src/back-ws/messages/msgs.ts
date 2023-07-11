import { wsServer } from '../../../index.js'
import { ExtendedWebSocket } from '../websocket-server.js';

export interface IMsg {
  type: string,
  data: string,
  id: number
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