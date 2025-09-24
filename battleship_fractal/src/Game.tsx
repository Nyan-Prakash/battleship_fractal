import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {emptyOcean, emptyPlayer, type GameState, initialGameState, type Board, placeBoat, type Player} from './logic'

function Game() {

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [connect, setConnected] = useState(false);
  const [waitingConnect, setWaitingConnection] = useState(false);

  const [player, setPlayer] = useState<Player>(emptyPlayer);
  
  const [ocean, setOcean] = useState<Board>(emptyOcean);
  const [rotate, setRotate] = useState(false);

  const [numberships, setnumberShips] = useState(5);


  const [name, setName] = useState<string>('');
  const [gameCode, setGameCode] = useState<number>();


    async function getGame(): Promise<GameState> {
        const res = await fetch("/game");
        const data = await res.json();
        setGameState(data);
        return data;
    }

    async function finishedPlacing(): Promise<void> {
        const res = await fetch(`finishedPlacing`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }
    

    async function placingBoat(params: { row: number, col: number }) {
        const res = await fetch(`/placeboat/${player.ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        })
        return await res.json()
    }

    async function updatedPlaceCount() {
        const res = await fetch(`/updatedPlaceCount/${player.ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }


    async function submitGame(params: { name: string, code: number }) {
        console.log(name); 
        const res = await fetch(`/startGame`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        })
        return await res.json()
    }
    const queryClient = useQueryClient()
    // Queries
    const { isPending, error, data } = useQuery({ queryKey: ['game'], queryFn: () => console.log() })
    //const state = data as GameState

    // Mutations
    const mutation = useMutation({
        mutationFn: placingBoat,
        onSuccess: () => {
        },
    })


    useEffect(() => {
    const interval = setInterval(() => {
        getGame();
    }, 1000); // 500ms = 0.5s

    return () => clearInterval(interval); // cleanup
    }, []);



  
  const OnHandleSelfClick = (x: number, y:number) => {
    let newGameState = structuredClone(gameState);
    if(!rotate)
    {
      if(numberships + y > 10)
      {
        return;
      }
      for(let i = 0; i < numberships; i++) {
        mutation.mutate({ row: x, col: y+i })

    }
    
    }
    else
    {
      if(numberships +x > 10)
      {
        return;
      }
      for(let i = 0; i < numberships; i++) {
        mutation.mutate({ row: x+i, col: y })
    }
    
    }
    setGameState(newGameState);
    setnumberShips(numberships-1);

    updatedPlaceCount()

  }



    async function handleSubmit(): Promise<void> {
        if (!name || !gameCode) {
            alert("You need both a name and gamecode");
            return;
        }
        setWaitingConnection(true);
        try {
            const res = await submitGame({ name, code: gameCode });
            if (res?.player) {
            setPlayer(res.player);
            setConnected(true);
            console.log("Joined as:", res.player); 
            }
            if (res?.gameState) setGameState(res.gameState);
        } catch (error) {
            console.log(error)
            alert("Failed to start game. Please try again.");
        } finally {
            setWaitingConnection(false);
        }
}

  return (
    <>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 flex flex-col gap-1 items-center justify-center">
  <h1 className="text-6xl text-white mb-6 absolute top-3">BattleShip 🚢</h1>
  <div>{JSON.stringify(gameState)}</div>
  <h3 className="text-lg font-normal text-white mb-6 absolute top-20 italic">By Nyan Prakash</h3>
  <div className="flex flex-col items-end absolute top-3 right-3 gap-2">

    <input
    type="text"
    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
    placeholder={"Type Name"}
    onChange={(e) => setName(e.target.value)}
    value={name}
    />
    <input
    type="text"
    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
    placeholder={"Enter code... "}
    onChange={(e) => setGameCode(e.target.value === "" ? undefined : Number(e.target.value))}
    value={gameCode}
    />

    <button className="px-4 py-2 bg-blue-700 text-white rounded-lg border border-white " onClick={() => handleSubmit()}>Submit</button>
    {waitingConnect && <div className=' text-white'>Waiting for another player...</div>}


      
  </div>
  <div className={`flex ${rotate ? "flex-col" : "flex-row"} gap-1 ml-2 absolute top-30 left-50`}>

    {player.ID !== undefined && gameState.players[player.ID] &&
      Array.from({length: numberships}, (_,i) => (
        <button
        key={i}
        className={`w-8 h-8 bg-white text-white rounded-xl animate-pulse  ${i === 0 ? "border-5 border-blue-950 bg-blue-950" : "bg-white"}`}
        style={{ animationDuration: '0.5s' }}
        onClick={i === 0 ? () => setRotate(!rotate) : undefined}
        ></button>
      ))
    }



</div>
{/* Player's Ocean Board */}
<div className="flex flex-row gap-30 items-end justify-center w-full mt-16 pt-10">
    {/* Player's Ocean Board */}
    <div className="flex flex-col gap-1">
        {player?.ID !== undefined && gameState.board.oceans[player.ID] ? (
            gameState.board.oceans[player.ID].map((row, ri) => (
                <div key={ri} className="flex gap-1">
                    {row.map((cell, ci) => (
                        <button
                            key={ci}
                            className={`w-8 h-8 text-white rounded-xl ${
                                cell === player.ID ? "bg-white" : "bg-blue-950"
                            }`}
                            onClick={() => OnHandleSelfClick(ri, ci)}
                        >
                            {player.ID}
                        </button>
                    ))}
                </div>
            ))
        ) : (
            <div>
                <div className="flex flex-col gap-1">
                    {ocean.oceans[1].map((row, ri) => (
                        <div key={ri} className="flex gap-1">
                            {row.map((cell, ci) => (
                                <button
                                    key={ci}
                                    className="w-8 h-8 bg-blue-200 opacity-60 text-white rounded-xl"
                                >
                                    {waitingConnect ? "?" : ""}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>

    {/* Info Panel */}
    <div className="flex flex-col items-center gap-6">
        {/* Ship Placement Info */}
        
        {connect ? (
            <div className="animate-bounce bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-56" style={{ animationDuration: '2s' }}>


                {gameState.state !== "Normal" ?

                <div className='text-white'>
                    {numberships > 0
                        ? `Place your ${numberships} ships`
                        : "All ships placed!"}
                </div>


                    : <div className='text-white'>
                    {player.ID !== undefined && gameState.currentPlayer == player ? "Your turn!" : "It's your enemies turn!"}
                        
                </div>}
            </div>
        ) : (
            <div className="bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-72 h-56 flex flex-col justify-center">
                <div className='text-white'>
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-2xl font-bold mb-2 text-white">How to Start the Game</h2>
                        <ol className="list-decimal list-inside text-lg text-blue-200 mb-2">
                            <li>Enter your name</li>
                            <li>Type in the Game Code</li>
                            <li>Press Start Game</li>
                        </ol>
                    </div>
                </div>
            </div>
        )}
    </div>

    {/* Opponent's Ocean Board */}
    <div className="flex flex-col gap-1">
        {player?.ID !== undefined && gameState.board.oceans[player.ID === 0 ? 1 : 0] ? (
            gameState.board.oceans[player.ID === 0 ? 1 : 0].map((row, ri) => (
                <div key={ri} className="flex gap-1">
                    {row.map((cell, ci) => (
                        <button
                            key={ci}
                            className="w-8 h-8 bg-gray-600 opacity-60 text-white rounded-xl"
                        >
                            {waitingConnect ? "?" : ""}
                        </button>
                    ))}
                </div>
            ))
        ) : (
            connect ? (
                <div className="text-white text-2xl w-full flex justify-center items-center h-32">
                    Connected
                </div>
            ) : (
                <div className="text-white text-2xl w-full flex justify-center items-center h-32 animate-bounce">
                    Waiting for opponent...
                </div>
            )
        )}
    </div>
</div>


</div>


    </>
  )
}

export default Game;

