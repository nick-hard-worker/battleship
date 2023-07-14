import { type ICoords, Game, gameRepository } from "../db/models/games.js";
import { type IUser, userRepository } from "../db/models/users.js";
import { ResType, formResponse, sendMsgsByWsID, wsSendTurn } from "../responses/msgs.js";
import { type ExtendedWebSocket } from "../websocket-server.js";

export const attack = (ws: ExtendedWebSocket, data: any): void => {
  const gameData = gameRepository.getByGameId(data.gameId);
  if (gameData == null) return;

  const currentGame = new Game(gameData);
  if (currentGame.activeUserId !== data.indexPlayer) return; // attacks from wrong player

  const attackCoords: ICoords = { x: data.x, y: data.y };
  const shotResult = currentGame.getAttackResult(attackCoords);
  gameRepository.update(currentGame); // save hint

  if (shotResult === "killed") {
    const killedShipIndex = currentGame.getEnemyShipIndex(attackCoords);
    const killedShip = currentGame.getEnemyShips()[killedShipIndex];
    for (const coord of killedShip.hittings) { // mark as kill all points of ship
      const dataShot = {
        position: coord,
        currentPlayer: data.indexPlayer, /* id of the player in the current game */
        status: shotResult,
      };
      const attackResponse = formResponse(ResType.attack, dataShot);
      sendMsgsByWsID(currentGame.getWsIds(), attackResponse);
    }

    const aroundCoords = getAroundCoords(killedShip.allCoords());
    for (const coord of aroundCoords) {
      const dataMiss = {
        position: coord,
        currentPlayer: data.indexPlayer, /* id of the player in the current game */
        status: "miss",
      };
      const attackResponse = formResponse(ResType.attack, dataMiss);
      sendMsgsByWsID(currentGame.getWsIds(), attackResponse);
    }

    wsSendTurn(currentGame);

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
      sendMsgsByWsID(currentGame.getWsIds(), finishResponse);
    }
    return;
  }

  const dataMissOrShot = {
    position: attackCoords,
    currentPlayer: data.indexPlayer, /* id of the player in the current game */
    status: shotResult,
  };
  const attackResponse = formResponse(ResType.attack, dataMissOrShot);
  sendMsgsByWsID(currentGame.getWsIds(), attackResponse);

  if (shotResult === "miss") { // turn if miss
    currentGame.changeActiveUser();
    gameRepository.update(currentGame);
  }
  wsSendTurn(currentGame);
};

export const randomAttack = (ws: ExtendedWebSocket, data: any): void => {
  data = { ...data, x: getRandomInteger(), y: getRandomInteger() };
  attack(ws, data);
};

function getRandomInteger(): number {
  return Math.floor(Math.random() * 10);
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