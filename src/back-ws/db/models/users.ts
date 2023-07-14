import { InMemoryRepository } from '../class-repository.js';

export interface IUser {
  id: number;
  name: string;
  password: string;
  wsId: string
  wins: number
}

// export class User implements IUser {
//   name: string;
//   password: string;
//   wsId: string
//   wins: number
//   constructor(name: string, password: string, wsId: string) {
//     this.name = name;
//     this.password = password;
//     this.wsId = wsId;
//     this.wins = 0;
//   }
// }

class UserRepository extends InMemoryRepository<IUser> {
  getByName(name: string): IUser | undefined {
    return this.entities.find(user => user.name === name);
  }

  getByWsId(wsId: string): IUser | undefined {
    return this.entities.find(user => user.wsId === wsId);
  }

  getWinners(): Array<{ name: string, wins: number }> {
    return this.getAll()
      .sort((a, b) => (b.wins - a.wins))
      .map(({ name, wins }) => { return { name, wins }; });
  }
}

export const userRepository = new UserRepository();
