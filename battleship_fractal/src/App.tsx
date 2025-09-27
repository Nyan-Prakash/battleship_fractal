import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./Game";
import { useState, useEffect } from "react";
import { GameState } from "./logic";

const queryClient = new QueryClient();

function App() {
  const [gameCode, setGameCode] = useState<string>();
  const [attached, setAttached] = useState<boolean>(false);
  const [waitingConnect, setWaitingConnection] = useState<boolean>();
  const [gameState, setGameState] = useState<GameState>();
  const [gameStateMap, setGameStateMap] = useState<string[]>();
  const [state, setState] = useState<string>();


  const[ID, setID] = useState<number>();



  async function handleCreate(): Promise<void> {
    try {
      const res = await submitGame();
      if (res?.player) {
        console.log("Joined as:", res.gameState.code);
        setGameCode(res.gameState.code)
      }
    } catch (error) {
      console.log(error);
      alert("Failed to start game. Please try again.");
    } finally {
    }
  }

  async function handleJoin(code: string): Promise<void> {
    try {
      const res = await joinGame(code);
      if (res?.player) {
        console.log("Joined as:", res.gameState.code);
      }
      setGameCode(res.gameState.code)

    } catch (error) {
      console.log(error);
      alert("Failed to start game. Please try again.");
    } finally {
      
    }
  }

  async function getGame(): Promise<void> {
    if (!gameCode) return;
    const res = await fetch("/game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameCode }),
    });

    const data = await res.json();
    if (data.gameState) {
      setGameState(data.gameState);
      setState(data.gameState.state);
    } else {
      console.log("Game not found");
    }
    return data.gameState;
  }

  async function getMultiGames(): Promise<void> {
    const res = await fetch("/games");
    const data = await res.json();
    const gameArray = data;
    setGameStateMap(gameArray);
  }

  async function submitGame() {
    setWaitingConnection(true);
    const res = await fetch(`/startGame`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setID(data.player.ID);

    return data;
  }

  async function joinGame(code: string) {
    setWaitingConnection(true);
    const res = await fetch(`/join/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setID(data.player.ID);

    return data;
  }

  useEffect(() => {
    const interval = setInterval(() => {

      if (gameCode) {
        getGame();
      } 
      else if (!waitingConnect) {
        getMultiGames();
      }
      if(gameState && state== "Placing")
      {
        setAttached(true);
      }
      
    }, 1000); // 500ms = 0.5s

    return () => clearInterval(interval); // cleanup
  }, [gameCode, waitingConnect, gameState?.state, gameState]);

  return (
    <QueryClientProvider client={queryClient}>
      {attached ? (
        <Game RealName={""} RealGameCode={gameCode ?? ""} RealID={ID ?? 404} />
      ) : (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-300 to-blue-200 flex flex-col gap-1 items-center justify-center">
          <h1 className="text-8xl text-white mb-6 absolute top-13 font-bold ">
            BattleShip 🚢
          </h1>

          {!waitingConnect ? (
            <div className="flex flex-col gap-3 ">
              <button
                className="px-4 py-2 bg-blue-400 text-white rounded-lg border border-white hover:bg-white hover:text-blue-700 text-5xl w-100 h-25  shadow-2xl"
                onClick={() => handleCreate()}
              >
                Create game
              </button>
              {gameStateMap &&
                gameStateMap.map((code, idx) => (
                  <button
                    key={code}
                    className="px-4 py-2 m-2 bg-blue-200 text-blue-900 rounded-lg border border-blue-400 hover:bg-blue-400 hover:text-white  shadow-2xl"
                    onClick={() => {
                      handleJoin(code);
                    }}
                  >
                    {code}
                  </button>
                ))}
            </div>
          ) : (
            <div className="text-5xl text-white animate-pulse">Waiting for the other player...</div>
          )}
        </div>
      )}
    </QueryClientProvider>
  );
}
export default App;
