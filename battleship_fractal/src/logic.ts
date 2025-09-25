export type Player = {
    name: string | undefined;
    ID: number | undefined;
    placedCount: number;
};

export type Cell = Number | "Air" | "Miss" | "Hit" | "Sonar" | "Sonar-Hit";

export type Ocean = Cell[][];

export type Board = {
    oceans: Ocean[];
};

export type GameState = {
    board: Board;
    code: number
    players: Player[];
    currentPlayer: number | undefined;
    winner: Player | undefined;
    state: "Placing" | "Normal" | "Waiting";
    playersPlaced: number;

};

export const emptyPlayer: Player = {
    name: undefined,
    ID: undefined,
    placedCount: 5,
};

export const emptyOcean: Board = {
    oceans: [
        Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => "Air")),
        Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => "Air"))
    ],
};

export const initialGameState: GameState = {
    code: 0,
    board: emptyOcean,
    players: [emptyPlayer, emptyPlayer],
    currentPlayer: undefined,
    winner: undefined,
    playersPlaced: 0,
    state: "Waiting",

    
};

export function placeBoat(x: number, y: number, ID: number, gameState: GameState): GameState {
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

export function hit(x: number, y: number, ID: number, gameState: GameState, powerUp: string): GameState {
    if (ID === undefined || ID < 0 || ID > 1) {
        return gameState;
    }

    let otherID = (ID == 0 ? 1 : 0)
    const newGameState: GameState = structuredClone(gameState);
    newGameState.currentPlayer = otherID;
    if (newGameState.currentPlayer) {
        newGameState.currentPlayer = otherID;
    }

    if(powerUp == "Sonar")
    {
        if (newGameState.board.oceans[otherID][x][y] === "Air") {
            newGameState.board.oceans[otherID][x][y] = "Sonar";
            return newGameState;
        }
        if (typeof newGameState.board.oceans[otherID][x][y] === "number") {
            newGameState.board.oceans[otherID][x][y] = "Sonar-Hit";
            return newGameState;
        }
    }
    else
    {

        if (newGameState.board.oceans[otherID][x][y] === "Air") {
            newGameState.board.oceans[otherID][x][y] = "Miss";
            return newGameState;
        }
        if (typeof newGameState.board.oceans[otherID][x][y] === "number") {
            newGameState.board.oceans[otherID][x][y] = "Hit";
            return newGameState;
        }
    }

    return gameState;
}