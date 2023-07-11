import { InMemoryRepository } from "./class-repository.js";
import { userRepository } from "./users.js";

export interface ICoords {
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

interface ShipConstructorParams {
  position: ICoords,
  direction: boolean,
  length: number,
  hittings?: ICoords[],
}

export class Ship implements IShip {
  position: ICoords
  direction: boolean
  length: number
  hittings: ICoords[]

  constructor({ position, direction, length, hittings }: IShip) {
    this.position = position;
    this.length = length;
    this.direction = direction;
    this.hittings = hittings || [];
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

type attackStatus = "miss" | "killed" | "shot";

interface IGameConstructorParams {
  gameId: number;
  activeUserId: number;
  players: IPlayer[];
}

export interface IGame {
  id: number,
  gameId: number,
  players: IPlayer[],
  activeUserId: number,
  getAttackResult: (coord: ICoords) => attackStatus;
}

export class Game implements IGame {
  id: number
  gameId: number
  activeUserId: number
  players: IPlayer[]

  constructor({ gameId, activeUserId, players }: IGameConstructorParams) {
    this.id = this.gameId = gameId;
    this.activeUserId = activeUserId;
    this.players = players;
  }

  static initGame(id1: number, id2: number) {
    const game = {
      gameId: id1,
      activeUserId: id1,
      players: [
        {
          userId: id1,
          ships: []
        },
        {
          userId: id2,
          ships: []
        }
      ]
    }
    return new Game(game)
  }

  changeActiveUser() {
    const nextPlayer = this.players.find(item => item.userId !== this.activeUserId);
    this.activeUserId = nextPlayer?.userId as number;
  }

  getWsIds() {
    return this.players
      .map(item => item.userId)
      .map(userId => userRepository.getById(userId)?.wsId) as string[];
  }

  getAttackResult(attackCoords: ICoords): attackStatus {
    const enemyShips = this.getEnemyShips()
    const shipIndex = this.getEnemyShipIndex(attackCoords);
    if (shipIndex === -1) return "miss"

    if (!isAlreadyShot(enemyShips[shipIndex], attackCoords)) {
      enemyShips[shipIndex].hittings.push(attackCoords);
    }
    if (enemyShips[shipIndex].hittings.length === enemyShips[shipIndex].allCoords().length) return "killed"
    return "shot"

    function isAlreadyShot(ship: Ship, coord: ICoords): boolean {
      return enemyShips[shipIndex].hittings.some((coord) => coord.x === attackCoords.x && coord.y === attackCoords.y)
    }
  }

  getEnemyShips() {
    const enemyPlayer = this.players.filter(player => player.userId !== this.activeUserId)[0];
    return enemyPlayer.ships.map(item => (new Ship(item)))
  }
  getEnemyShipIndex(attackCoords: ICoords) {
    const enemyPlayer = this.players.filter(player => player.userId !== this.activeUserId)[0];
    const enemyShips = enemyPlayer.ships.map(item => (new Ship(item)))
    const shipIndex = enemyShips.findIndex(ship => ship.allCoords().some(
      (item) => item.x === attackCoords.x && item.y === attackCoords.y))
    return shipIndex
  }
}

class GameRepository extends InMemoryRepository<IGame> {
  constructor() {
    super();
  }

  getByGameId(id: number) {
    return this.entities.find(game => game.gameId === id);
  }
}

export const gameRepository = new GameRepository();