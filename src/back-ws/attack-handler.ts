import { ICoords, Game, gameRepository } from "./db/models/games.js";
import { IUser, userRepository } from "./db/models/users.js";
import { ResType, formResponse, sendMsgsByWsID } from "./messages/msgs.js";
import { ExtendedWebSocket } from "./websocket-server.js";

export const attack = (ws: ExtendedWebSocket, data: any, id: number) => {
  const gameData = gameRepository.getByGameId(data.gameId);
  if (!gameData) return;
  const currentGame = new Game(gameData);
  if (currentGame.activeUserId !== data.indexPlayer) return; // attacks from wrong player

  const attackCoords: ICoords = { x: data.x, y: data.y };
  const shotResult = currentGame.getAttackResult(attackCoords);
  gameRepository.update(currentGame)

  if (shotResult === "killed") {
    const killedShipIndex = currentGame.getEnemyShipIndex(attackCoords);
    const killedShip = currentGame.getEnemyShips()[killedShipIndex]
    for (const coord of killedShip.hittings) { // mark as kill all points of ship
      const attackResponse = {
        type: "attack",
        data: JSON.stringify({
          position: coord,
          currentPlayer: data.indexPlayer, /* id of the player in the current game */
          status: shotResult,
        }),
        id,
      }
      sendMsgsByWsID(currentGame.getWsIds(), attackResponse);
    }

    const aroundCoords = getAroundCoords(killedShip.allCoords());
    for (const coord of aroundCoords) {
      const attackResponse = {
        type: "attack",
        data: JSON.stringify({
          position: coord,
          currentPlayer: data.indexPlayer, /* id of the player in the current game */
          status: "miss",
        }),
        id,
      }
      sendMsgsByWsID(currentGame.getWsIds(), attackResponse);
    }

    if (currentGame.isEndGame()) {
      // update winners
      const currentUser = userRepository.getById(currentGame.activeUserId) as IUser;
      currentUser.wins++;
      userRepository.update(currentUser);
      const dataWinners = userRepository.getWinners();
      const responseWinners = formResponse(ResType.updateWinners, dataWinners);
      sendMsgsByWsID('all', responseWinners);

      const dataFinish = {
        winPlayer: currentGame.activeUserId,
      };
      const finishResponse = formResponse(ResType.finish, dataFinish);
      sendMsgsByWsID(currentGame.getWsIds(), finishResponse)
    }
    return;
  }

  const attackResponse = {
    type: "attack",
    data: JSON.stringify({
      position: attackCoords,
      currentPlayer: data.indexPlayer, /* id of the player in the current game */
      status: shotResult,
    }),
    id,
  }
  sendMsgsByWsID(currentGame.getWsIds(), attackResponse)

  if (shotResult === "miss") {
    currentGame.changeActiveUser();
    gameRepository.update(currentGame);

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
}

function getAroundCoords(shipCoords: ICoords[]): ICoords[] {
  const pointsArr: ICoords[] = [];
  const minX = Math.min(...shipCoords.map(item => item.x));
  const maxX = Math.max(...shipCoords.map(item => item.x));
  const minY = Math.min(...shipCoords.map(item => item.y));
  const maxY = Math.max(...shipCoords.map(item => item.y));
  const leftUpX = (minX === 0) ? minX : (minX - 1);
  const leftUpY = (minY === 0) ? minY : (minY - 1);
  const rightDownX = (maxX === 9) ? maxX : (maxX + 1);
  const rightDownY = (maxY === 9) ? maxY : (maxY + 1);

  for (let x = leftUpX; x <= rightDownX; x++) {
    for (let y = leftUpY; y <= rightDownY; y++) {
      const point: ICoords = { x, y };
      if (!shipCoords.some(shipCoord => shipCoord.x === x && shipCoord.y === y)) {
        pointsArr.push(point);
      }
    }
  }

  return pointsArr;
}