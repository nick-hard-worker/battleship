import { roomRepository, userRepository, IRoom, IUser } from './db/db.js';
import { ExtendedWebSocket } from './websocket-server.js'
// 2 actions for room: createRoom, addUserToRoom:

export function createRoom(ws: ExtendedWebSocket, data: any, id: number) {
  console.log('Received createRoom message:', data);
  const currentUser = userRepository.getAll().find(user => user.wsId === ws.id) as IUser;
  const createdRoom = roomRepository.create(
    {
      roomUsers: [
        {
          name: currentUser.name,
          index: currentUser.id
        }
      ]
    });
  const noFullRooms = roomRepository.getAll().filter(room => room.roomUsers.length < 2);

  const response = {
    type: 'update_room',
    data: JSON.stringify(noFullRooms),
    id,
  };

  ws.send(JSON.stringify(response));
}
