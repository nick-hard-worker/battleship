import { InMemoryRepository } from './memory-repository.js';

class UserRepository extends InMemoryRepository {
  constructor() {
    super();
  }

  getByName(name) {
    return this.entities.find(user => user.name === name);
  }

  static createRepository() {
    return new UserRepository();
  }
}

export const userRepository = UserRepository.createRepository();
export const roomRepository = InMemoryRepository.createRepository();
