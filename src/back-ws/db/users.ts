import { InMemoryRepository } from './class-repository.js';

export interface IUser {
  id: number;
  name: string;
  password: string;
  wsId: string
}

class UserRepository extends InMemoryRepository<IUser> {
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
