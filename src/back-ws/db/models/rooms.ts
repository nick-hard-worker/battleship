import { InMemoryRepository } from '../class-repository.js';

export interface IRoom {
  id?: number;
  roomUsers: Array<{
    name: string;
    index: number;
  }>
}

export const roomRepository = new InMemoryRepository<IRoom>();
