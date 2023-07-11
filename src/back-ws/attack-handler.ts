import { ICoords, Game, gameRepository } from "./db/games.js";
import { ExtendedWebSocket, sendMsgsByWsID } from "./websocket-server.js";


export const attack = (ws: ExtendedWebSocket, data: any, id: number) => {
  const gameData = gameRepository.getByGameId(data.gameId);
  if (!gameData) return;
  const currentGame = new Game(gameData);
  if (currentGame.activeUserId !== data.indexPlayer) return; // attacks from wrong player

  const attackCoords: ICoords = { x: data.x, y: data.y };
  const shotResult = currentGame.getAttackResult(attackCoords);
  gameRepository.update(currentGame)

  const attackResponse = {
    type: "attack",
    data: JSON.stringify({
      position: attackCoords,
      currentPlayer: data.indexPlayer, /* id of the player in the current game */
      status: shotResult,
    }),
    id,
  }

  // if (shotResult === "killed") {
  //   for (const coord of )
  //   return
  // }
  sendMsgsByWsID(currentGame.getWsIds(), JSON.stringify(attackResponse))
  // ws.send()
}