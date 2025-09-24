import express from "express";
import ViteExpress from "vite-express";
import { emptyPlayer, initialGameState, placeBoat, type GameState } from "../src/logic.ts";

const app = express();
app.use(express.json())

let gameState = initialGameState;

let Player1 = emptyPlayer;
let Player2 = emptyPlayer;



type MoveRequest = {
    row: number,
    col: number
}

app.post("/updatedPlaceCount/:id", (req, Request, res: Request) => {
    
  const playerId = parseInt(req.params.id);
  if(gameState.players[playerId].placedCount == 2)
    {
      gameState.players[playerId].placedCount = 0
    }
    else{
          gameState.players[playerId].placedCount -= 1;
    }


    
});

app.post("/placeboat/:id", (req: Request, res: Response) => {
    const moveReq = req.body as MoveRequest;
    const playerId = parseInt(req.params.id);
    gameState = placeBoat(moveReq.row, moveReq.col, playerId, gameState);
    res.json(gameState);
});

app.post("/finishedPlacing", (req, Request, res: Request) => {
  gameState.playersPlaced += 1;

  if(gameState.playersPlaced == 2)
  {
    gameState.state = "Normal";
    gameState.currentPlayer = gameState.players[0];
  }
});


app.post("/startGame", (req: Request, res: Response) => {
  const { name, code } = req.body;
  console.log(name + code);
  // Initialize a new game if codes don't match or no players yet
  const startingNewGame =
    gameState.code !== code ||
    !Array.isArray(gameState.players) ||
    !gameState.players[0];

  if (startingNewGame) {
    gameState = initialGameState;

    gameState.code = code;
    gameState.players[0] = { ID: 0, name, placedCount: 5 };
    gameState.state = "Placing";
    return res.json({
      player: gameState.players[0],
      gameState,
    });
  }

  // If player 2 slot is free, join them
  if (gameState.code == code) {
    gameState.players[1] = { ID: 1, name, placedCount: 5 };
    return res.json({
      player: gameState.players[1], 
      gameState,
    });
  }

  // Otherwise game is full
  return res.status(400).json({ message: "Game already has 2 players." });
});


app.get("/game", (_, res) => res.json(gameState));


import type { Request, Response } from "express";



ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));