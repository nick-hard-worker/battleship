import { InMemoryRepository } from './memory-repository.js';

export interface IUser {
  id: number;
  name: string;
  password: string;
  wsId: string
}

export interface IRoom {
  id: number;
  roomUsers: {
    name: string;
    index: number;
  }[]
}

class UserRepository extends InMemoryRepository<IUser, Omit<IUser, 'id'>> {
  constructor() {
    super();
  }

  getByName(name: string) {
    return this.entities.find(user => user.name === name);
  }

  getByWsId(wsId: string) {
    return this.entities.find(user => user.wsId === wsId);
  }
}

export const userRepository = new UserRepository();
export const roomRepository = new InMemoryRepository<IRoom, Omit<IRoom, 'id'>>();
