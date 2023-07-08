import { userRepository, IUser } from './db/db.js';
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
  else connectedUser = userRepository.create({ ...data, wsId: ws.id });
  console.log(connectedUser);

  const response = {
    type: 'reg',
    data: JSON.stringify({
      name: connectedUser.name,
      index: connectedUser.id,
      error: false,
      errorText: '',
    }),
    id,
  };

  console.log('total users: ' + userRepository.getAll().length);

  ws.send(JSON.stringify(response));
}