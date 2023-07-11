import { IUser, userRepository } from '../db/models/users.js';
import { gameRepository } from '../db/models/games.js';
import { Game, Ship } from '../db/models/games.js';
import { sendMsgsByWsID } from '../responses/msgs.js';
import { ExtendedWebSocket } from '../websocket-server.js'

export function addShips(ws: ExtendedWebSocket, data: any, id: number) {
  const gameData = gameRepository.getByGameId(data.gameId)
  if (!gameData) return;

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
  const responseCurrent = {
    type: "start_game",
    data: JSON.stringify(
      {
        ships:
          [],
        currentPlayerIndex: playerId
      }),
    id: 0
  }
  const responseSecond = {
    type: "start_game",
    data: JSON.stringify(
      {
        ships:
          [],
        currentPlayerIndex: secondUser.id
      }),
    id: 0
  }
  ws.send(JSON.stringify(responseCurrent))
  sendMsgsByWsID(secondUser.wsId, responseSecond);

  const responseTurn =
  {
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: currentGame.activeUserId,
    }),
    id: 0,
  };
  sendMsgsByWsID(currentGame.getWsIds(), responseTurn);

}