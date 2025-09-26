import express from "express";
import ViteExpress from "vite-express";
import { emptyPlayer, hit, initialGameState, placeBoat, type GameState } from "../src/logic.ts";
import {v4 as uuidv4} from 'uuid';


const app = express();
app.use(express.json())

let gameState = initialGameState;

let Player1 = emptyPlayer;
let Player2 = emptyPlayer;

const gameStates: Map<string, GameState> = new Map();

type MoveRequest = {
    row: number,
    col: number,
    gameCode: string;
}

app.post("/updatedPlaceCount/:id/:gameCode", (req: Request, res: Request) => {
    
  const playerId = parseInt(req.params.id);
  const gameCode: string = req.params.gameCode;

  const localState = gameStates.get(gameCode);

  if(localState !== undefined)
  {
    if(localState.players[playerId].placedCount == 2)
    {
      localState.players[playerId].placedCount = 0
    }
    else
      {
          localState.players[playerId].placedCount -= 1;
    }
      gameStates.set(gameCode, localState);

  }

    return res.json({ message: "yes" });


    
});

app.post("/placeboat/:id", (req: Request, res: Response) => {
    const moveReq = req.body as MoveRequest;
    const playerId = parseInt(req.params.id);
    const localState = gameStates.get(moveReq.gameCode);


    if (!localState) {
        return res.status(404).json({ error: "Game not found" });
    }
    const updatedState = placeBoat(moveReq.row, moveReq.col, playerId, localState);
    gameStates.set(moveReq.gameCode, updatedState);
    return res.json(updatedState);
});

app.post("/Shooting", (req: Request, res: Response) => {
  const { row, col, id, powerUp, gameCode } = req.body as { row: number; col: number; id: number, powerUp: string, gameCode: string};
  const playerId = parseInt(id.toString());

  const localState = gameStates.get(gameCode);

  if (!localState) {
    return res.status(404).json({ error: "Game not found" });
  }

  const updatedState = hit(row, col, playerId, localState, powerUp);
  gameStates.set(gameCode, updatedState);

  return res.json(updatedState);
});


app.post("/finishedPlacing/:gameCode", (req: Request, res: Request) => {

  const gameCode: string = req.params.gameCode;

  const localState = gameStates.get(gameCode);
  if(localState)
  {
    localState.playersPlaced += 1;

  if(localState.playersPlaced == 2)
  {
    localState.state = "Normal";
    localState.currentPlayer = gameState.players[0].ID;
  }
  gameStates.set(gameCode, localState);
  }
  return res.json({ message: "yes" });

});


app.post("/startGame", (req: Request, res: Response) => {
  
    gameState = initialGameState;

    gameState.code = uuidv4();
    gameState.players[0] = { ID: 0, placedCount: 5, money: 1 };
    gameState.state = "Waiting";


    gameStates.set(gameState.code, gameState);
    console.log(gameStates)
    return res.json({
      player: gameState.players[0],
      gameState,
    });
  }
);

app.post(`/join/:gameCode`, (req: Request, res: Response) => {
  
    gameState.players[1] = { ID: 1, placedCount: 5, money: 1 };
    gameState.state = "Placing";


    gameStates.set(gameState.code, gameState);
    console.log(gameStates)
    return res.json({
      player: gameState.players[1],
      gameState,
    });
  }
);

app.get("/games", (req, res) => {
    res.json([...gameStates.keys()])
})


app.post("/game", (req, res) => {
  const { gameCode } = req.body;
  const state = gameStates.get(gameCode);
  if (!state) {
    return res.status(404).json({ error: "Game not found" });
  }
  return res.json({ gameState: state });
});


import type { Request, Response } from "express";



ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));