import { roomRepository, userRepository } from './db/db.js';
// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws, data, id) {
  const currentUser = userRepository.getAll().find(user => user.wsId === ws.id);
  const createdRoom = roomRepository.create(
    {
      roomUsers: [
        {
          name: currentUser.name,
          index: currentUser.id
        }
      ]
    });
  console.log('Received createRoom message:', data);

  const response = {
    type: 'update_room',
    data: JSON.stringify({
      roomId: createdRoom.id,
      roomUsers: createdRoom.roomUsers
    }),
    id,
  };

  ws.send(JSON.stringify(response));
}

export function addUserToRoom(ws, data, id) {
  //  logic ???
  console.log('Received addUserToRoom message:', data);

  const response = {
    type: 'reg',
    data: JSON.stringify({
      name: data.name,
      index: 1,
      error: false,
      errorText: '',
    }),
    id,
  };

  ws.send(JSON.stringify(response));
}