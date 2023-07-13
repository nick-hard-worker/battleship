import { userRepository, IUser } from '../db/models/users.js';
import { ResType, formResponse, sendMsgsByWsID, wsSendUpdateRoom } from '../responses/msgs.js';
import { ExtendedWebSocket } from '../websocket-server.js'

// type "reg" handler:
export function handleRegistration(ws: ExtendedWebSocket, data: any, id: number) {
  let connectedUser: IUser;
  const foundUser = userRepository.getByName(data.name);
  if (foundUser) {
    if (foundUser.password !== data.password) {
      const dataErrPswd = {
        name: foundUser.name,
        index: foundUser.id,
        error: true,
        errorText: 'Incorrect password',
      }
      const responseErrPswd = formResponse(ResType.reg, dataErrPswd)
      sendMsgsByWsID(ws.id, responseErrPswd)
      return
    }

    connectedUser = userRepository.update({ ...foundUser, wsId: ws.id }) as IUser;
  }
  else connectedUser = userRepository.add({ ...data, wsId: ws.id, wins: 0 });

  const dataResponse = {
    name: connectedUser.name,
    index: connectedUser.id,
    error: false,
    errorText: '',
  }
  const responseReg = formResponse(ResType.reg, dataResponse)
  sendMsgsByWsID(ws.id, responseReg)
  wsSendUpdateRoom()

  const dataWinners = userRepository.getWinners();
  const responseWinners = formResponse(ResType.updateWinners, dataWinners);
  sendMsgsByWsID('all', responseWinners)
}