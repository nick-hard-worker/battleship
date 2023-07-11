import { userRepository, IUser } from './db/db.js';
import { ResType, formResponse, wsSendUpdateRoom } from './messages/msgs.js';
import { ExtendedWebSocket } from './websocket-server.js'

// type "reg" handler:
export function handleRegistration(ws: ExtendedWebSocket, data: any, id: number) {
  console.log('Received reg message:', data, ws.id);
  let connectedUser: IUser;
  const foundUser = userRepository.getByName(data.name);
  if (foundUser) {
    // check password
    connectedUser = userRepository.update({ ...foundUser, wsId: ws.id }) as IUser;
  }
  else connectedUser = userRepository.add({ ...data, wsId: ws.id, wins: 0 });
  console.log(connectedUser);

  const dataResponse = {
    name: connectedUser.name,
    index: connectedUser.id,
    error: false,
    errorText: '',
  }
  const responseReg = formResponse(ResType.reg, dataResponse)
  ws.send(JSON.stringify(responseReg));
  wsSendUpdateRoom(ws)

  const winners = userRepository.getWinners();
  const responseWinners = {
    type: "update_winners",
    data: JSON.stringify(winners),
    id
  }

  ws.send(JSON.stringify(responseWinners));
}