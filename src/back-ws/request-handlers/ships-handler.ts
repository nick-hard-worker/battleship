import { type IUser, userRepository } from '../db/models/users.js';
import { gameRepository, Game, Ship } from '../db/models/games.js';
import { ResType, formResponse, sendMsgsByWsID } from '../responses/msgs.js';
import { type ExtendedWebSocket } from '../websocket-server.js';

export function addShips(ws: ExtendedWebSocket, data: any): void {
  const gameData = gameRepository.getByGameId(data.gameId);
  if (gameData === undefined) return;

  const currentGame = new Game(gameData);
  const playerId = data.indexPlayer;
  const index = currentGame.players.findIndex(player => player.userId === playerId);
  const ships = data.ships as Ship[];
  for (const ship of ships) {
    const shipFromData = new Ship(ship);
    currentGame.players[index].ships.push(shipFromData);
  }
  gameRepository.update(currentGame);

  if (currentGame.players[0].ships.length === 0 || currentGame.players[1].ships.length === 0) return;

  // two users in room:
  const secondPlayer = currentGame.players.find(player => player.userId !== playerId);
  const secondUser = userRepository.getById(secondPlayer?.userId as number) as IUser;

  const dataResponseToCurrent = {
    ships: [],
    currentPlayerIndex: playerId
  };
  const responseToCurrent = formResponse(ResType.startGame, dataResponseToCurrent);
  sendMsgsByWsID(ws.id, responseToCurrent);

  const dataResponseToSecond = {
    ships: [],
    currentPlayerIndex: secondUser.id
  };
  const responseToSecond = formResponse(ResType.startGame, dataResponseToSecond);
  sendMsgsByWsID(secondUser.wsId, responseToSecond);

  const dataTurn = { currentPlayer: currentGame.activeUserId };
  const responseTurn = formResponse(ResType.turn, dataTurn);
  sendMsgsByWsID(currentGame.getWsIds(), responseTurn);
}