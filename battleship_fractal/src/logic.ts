export type Player = {
  ID: number | undefined;
  placedCount: number;
  money: number;
};

export type Cell = number | "Air" | "Miss" | "Hit" | "Sonar" | "Sonar-Hit";

export type Ocean = Cell[][];

export type Board = {
  oceans: Ocean[];
};

export type GameState = {
  board: Board;
  code: string;
  players: Player[];
  currentPlayer: number | undefined;
  winner: number;
  state: "Placing" | "Normal" | "Waiting";
  playersPlaced: number;
};

export const emptyPlayer: Player = {
  ID: undefined,
  placedCount: 5,
  money: 0,
};

export const emptyOcean: Board = {
  oceans: [
    Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => "Air")),
    Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => "Air")),
  ],
};

export const initialGameState: GameState = {
  code: "",
  board: emptyOcean,
  players: [emptyPlayer, emptyPlayer],
  currentPlayer: undefined,
  winner: 99,
  playersPlaced: 0,
  state: "Waiting",
};

export function placeBoat(
  x: number,
  y: number,
  ID: number,
  gameState: GameState
): GameState {
  if (ID === undefined || ID < 0 || ID > 1) {
    return gameState;
  }
  const newGameState: GameState = structuredClone(gameState);

  if (newGameState.board.oceans[ID][x][y] === "Air") {
    newGameState.board.oceans[ID][x][y] = ID;
    return newGameState;
  }

  return gameState;
}

export function hit(
  x: number,
  y: number,
  ID: number,
  gameState: GameState,
  powerUp: string
): GameState {
  if (ID === undefined || ID < 0 || ID > 1) {
    return gameState;
  }

  let otherID = ID == 0 ? 1 : 0;
  const newGameState: GameState = structuredClone(gameState);
  newGameState.currentPlayer = otherID;

  if (powerUp == "Sonar") {
    if (newGameState.board.oceans[otherID][x][y] === "Air") {
      newGameState.board.oceans[otherID][x][y] = "Sonar";
      return newGameState;
    }
    if (typeof newGameState.board.oceans[otherID][x][y] === "number") {
      newGameState.board.oceans[otherID][x][y] = "Sonar-Hit";

      let numCount = 0;
      for (let r = 0; r < newGameState.board.oceans.length; r++) {
        for (let c = 0; c < newGameState.board.oceans[r].length; c++) {
          if (typeof newGameState.board.oceans[otherID][r][c] === "number") {
            numCount++;
          }
        }

        console.log(numCount);
        if (numCount == 0) {
            newGameState.winner = ID;
        }
      }

      return newGameState;
    }
  } else {
    if (newGameState.board.oceans[otherID][x][y] === "Air") {
      newGameState.board.oceans[otherID][x][y] = "Miss";
      return newGameState;
    }
    if (typeof newGameState.board.oceans[otherID][x][y] === "number") {
      newGameState.board.oceans[otherID][x][y] = "Hit";



      let numCount = 0;
      for (let r = 0; r > 11; r++) {
        for (let c = 0; c > 11; c++) {
          if (typeof newGameState.board.oceans[otherID][r][c] === "number") {
            numCount++;
          }
        }

        console.log(numCount);
        if (numCount == 0) {
            newGameState.winner = ID;
        }

      }
      
      return newGameState;
    }
  }

  return gameState;
}
