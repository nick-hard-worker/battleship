import { InMemoryRepository } from "./class-repository.js";

interface ICoords {
  x: number,
  y: number,
}

interface IShip {
  position: ICoords,
  direction: boolean,
  length: number,
  hittings: ICoords[],
  allCoords: () => ICoords[],

}

export class Ship implements IShip {
  hittings: ICoords[];
  constructor(
    public position: ICoords,
    public direction: boolean,
    public length: number) {
    this.hittings = [];
  }

  allCoords() {
    const coords = [] as ICoords[];
    const start = (this.direction) ? this.position.y : this.position.x;
    for (let i = start; i < start + this.length; i++) {
      if (this.direction) coords.push({ x: this.position.x, y: i }) //vertical
      else coords.push({ x: i, y: this.position.y }) // horizontal
    }

    return coords;
  };

}

interface IPlayer {
  userId: number,
  ships: IShip[]
}

export interface IGame {
  id: number,
  gameId: number,
  players: IPlayer[]
}

// class GameRepository extends InMemoryRepository<IGame, Omit<IGame, 'id'>> {
//   gameId: number
//   players: IPlayer[]

//   create(entity: Omit<IGame, "id">): IGame {
//     super.create()
//     this.gameId = id1;
//     this.players = [
//       { userId: id1, ships: [] },
//       { userId: id2, ships: [] }
//     ];
//   }
// }

export const gameRepository = new InMemoryRepository<IGame, Omit<IGame, 'id'>>();
