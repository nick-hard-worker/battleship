import { gameRepository, IGame, IUser, userRepository } from './db/db.js';
import { Ship } from './db/games.js';
import { ExtendedWebSocket, sendMsgsByWsID } from './websocket-server.js'

export function addShips(ws: ExtendedWebSocket, data: any, id: number) {
  // console.log(data)
  console.log(gameRepository.getAll());
  const currentGame = gameRepository.getById(data.gameId)
  if (!currentGame) return;
  const playerId = data.indexPlayer;
  const index = currentGame.players.findIndex(player => player.userId === playerId)
  // currentGame.players[index].ships
  for (const ship of data.ships) {
    const shipFromData = new Ship(ship.position, ship.direction, ship.length);
    currentGame.players[index].ships.push(shipFromData);
    // console.log(shipFromData.allCoords());
  }
  gameRepository.update(currentGame)

  console.log(currentGame)

  if (currentGame.players[0].ships.length > 0 && currentGame.players[1].ships.length > 0) {
    const secondPlayer = currentGame.players.find(player => player.userId !== playerId);
    const secondUser = userRepository.getById(secondPlayer?.userId as number) as IUser;
    const responseСurrent = {
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
    ws.send(JSON.stringify(responseСurrent))
    sendMsgsByWsID(secondUser.wsId, JSON.stringify(responseSecond));

    const responseTurn =
    {
      type: "turn",
      data: JSON.stringify({
        currentPlayer: currentGame.gameId,
      }),
      id: 0,
    };
    sendMsgsByWsID([ws.id, secondUser.wsId], JSON.stringify(responseTurn));
  }
}