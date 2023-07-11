import { ICoords, Game, gameRepository } from "./db/games.js";
import { ExtendedWebSocket } from "./websocket-server.js";


export const attack = (ws: ExtendedWebSocket, data: any, id: number) => {
  const gameData = gameRepository.getByGameId(data.gameId);
  if (!gameData) return;
  const currentGame = new Game(gameData);
  if (currentGame.activeUserId !== data.indexPlayer) return; // attacks from wrong player

  const attackCoords: ICoords = { x: data.x, y: data.y };
  const result = currentGame.getAttackResult(attackCoords);
  // gameRepository.update()

  const attackResponse = {
    type: "attack",
    data: JSON.stringify({
      position: attackCoords,
      currentPlayer: data.indexPlayer, /* id of the player in the current game */
      status: result,
    }),
    id,
  }

  ws.send(JSON.stringify(attackResponse))
}