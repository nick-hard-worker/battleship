import { userRepository } from './db/db.js';

// type "reg" handler:
export function handleRegistration(ws, data, id) {
  console.log('Received reg message:', data, ws.id);
  let connectedUser;
  connectedUser = userRepository.getByName(data.name);
  if (connectedUser) {
    // check password
    connectedUser = userRepository.update(connectedUser.id, { ...connectedUser, wsId: ws.id });
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