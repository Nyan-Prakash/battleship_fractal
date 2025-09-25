import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {  useMutation } from '@tanstack/react-query'
import {emptyOcean, emptyPlayer, type GameState, initialGameState, type Board, placeBoat, type Player} from './logic'

function Game() {

    type ShootRequest = { row: number; col: number; id: number, powerUp: string};

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [connect, setConnected] = useState(false);
  const [waitingConnect, setWaitingConnection] = useState(false);

  const [player, setPlayer] = useState<Player>(emptyPlayer);
  
  const [finishedplacing, setFinishedPlacing] = useState(false);
  const [ocean, setOcean] = useState<Board>(emptyOcean);
  const [rotate, setRotate] = useState(false);

  const [rotateTor, setRotateTor] = useState<String>("Nope");

  const [powerUp, setPowerUp] = useState("None");



  const [name, setName] = useState<string>('');
  const [gameCode, setGameCode] = useState<number>();


    async function getGame(): Promise<GameState> {
        const res = await fetch("/game");
        const data = await res.json();
        setGameState(data);
        return data;
    }

    async function finishedPlacing(): Promise<void> {
            await fetch('/finishedPlacing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

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
        console.log("updatedPlaceCount")
        return await fetch(`/updatedPlaceCount/${player.ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }

    async function handleShoot(ri: number, ci: number) {
        if (player?.ID === undefined && gameState.currentPlayer != player.ID) {
            console.warn("No player ID yet; can’t shoot.");
            return;
        }
        try {
            if(player.ID == undefined)
            {
                return;
            }

            if(powerUp == "Torpedo")
            {
                if(rotateTor == "|")
                {
                    for(let num = 0; num < 10; num++)
                    {
                        await shooting({ row: num, col: ci, id: player.ID, powerUp: powerUp });

                    }
                }
                if(rotateTor == "-")
                {
                    for(let num = 0; num < 10; num++)
                    {
                        await shooting({ row: ri, col: num, id: player.ID, powerUp: powerUp });

                    }
                }

            }
            else
            {
                await shooting({ row: ri, col: ci, id: player.ID, powerUp: powerUp });

            }

            
        } catch (err) {
            console.error(err);
            alert("Shot failed. Check server logs and network tab.");
        }
        }
    async function shooting(params: ShootRequest): Promise<void> {
        const res = await fetch("/Shooting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Shooting failed (${res.status}): ${text}`);
        }
        return res.json();
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
    // Queries
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
    }, 100); // 500ms = 0.5s

    return () => clearInterval(interval); // cleanup
    }, []);



  

const OnHandleSelfClick = async (x: number, y: number) => { 
  if (!rotate) {
    if (player.ID === undefined || !gameState.players[player.ID]) return;


    if (gameState.players[player.ID].placedCount + y > 10) return;


        for (let i = 0; i < gameState.players[player.ID].placedCount; i++) 
        {
            if(typeof gameState.board.oceans[player.ID][x][y+i] == "number")
            {
                return;
            }

        }

        for (let i = 0; i < gameState.players[player.ID].placedCount; i++) 
        {
            mutation.mutate({ row: x, col: y + i });
        }
    } 
    else {
        if (player.ID === undefined || !gameState.players[player.ID]) return;

        if (gameState.players[player.ID].placedCount + x > 10) return;



        for (let i = 0; i < gameState.players[player.ID].placedCount; i++) 
        {
            if(typeof gameState.board.oceans[player.ID][x+i][y] == "number")
            {
                return;
            }

        }


        for (let i = 0; i < gameState.players[player.ID].placedCount; i++) 
        {
            mutation.mutate({ row: x + i, col: y });

        }
  }

  let next = 0;
  if (player.ID !== undefined && gameState.players[player.ID]) {
    next = gameState.players[player.ID].placedCount - 1;
    await updatedPlaceCount();   

    console.log(next)
    if (next == 1) {
    
      console.log("Finishing placing")

      await finishedPlacing();    
    }
  }
};



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
        function FindSurroundingShips (ri: number, ci: number, Me: boolean): String
        {

            let numShipsDetect = 0;

            let ID = 1;

            if(Me)
            {
                ID = player.ID !== undefined ? player.ID : 0;
            }
            
  
            for(let row = -1; row < 2; row++)
            {
                for(let col = -1; col < 2; col++)
                {
                    if(typeof (gameState.board.oceans[ID][ri+row][ci+col]) == "number")
                    {
                        numShipsDetect++;
                    }
                }
            }
            if(numShipsDetect == 0)
            {
                return String(0);
            }

            return String(numShipsDetect);
        }

  return (
    <>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 flex flex-col gap-1 items-center justify-center">
  <h1 className="text-6xl text-white mb-6 absolute top-3">
    BattleShip 🚢
  </h1>
  <h3 className="text-lg font-normal text-white mb-6 absolute top-20 italic">By Nyan</h3>
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
      Array.from({length: gameState.players[player.ID].placedCount}, (_,i) => (
        <button
        key={i}
        className={`w-8 h-8 bg-white text-white rounded-xl animate-pulse  ${i === 0 ? "border-5 border-blue-950 bg-blue-950" : "bg-white"}`}
        style={{ animationDuration: '0.5s' }}
        onClick={i === 0 ? () => setRotate(!rotate) : undefined}
        ></button>
      ))
    }



</div>

  {gameState.currentPlayer === player.ID && (<div className=" bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-80" style={{ animationDuration: '2s' }}>



                <div className='text-white flex flex-col gap-5'>
                    <h2 className="text-2xl font-bold mb-2 text-white">Shop {powerUp}{String(rotateTor)}</h2>
                    <div className='flex flex-row gap-10'>

                        <button className={`flex flex-col gap-2 items-center rounded-2xl p-4 hover:bg-sky-700 ${powerUp=="Sonar" ? "bg-sky-700" : ""}`} onClick={() => 
                        { 
                            setRotateTor("|");
                            if(powerUp=="Sonar" ) 
                                { 
                                    setPowerUp("None")
                                } 
                            else 
                            {
                            setPowerUp("Sonar");
                            }
                    }}><div
                            className={`w-8 h-8 bg-white text-black rounded-xl animate-pulse`}
                            style={{ animationDuration: '0.5s' }}
                            
                            >?</div>

                        <p className='text-[20px]'>Sonar</p>
                        <p className='italic text-[10px]'>Detect surrounding ships</p>                
                        </button>

                        <button className={`flex flex-col gap-2 items-center rounded-2xl p-4  hover:bg-sky-700 ${powerUp=="Torpedo" && "bg-sky-700 "}`} onClick={() => {
                                
                                if(powerUp != "Torpedo" && rotateTor=="|")
                                {
                                    setPowerUp("Torpedo");
                                    setRotateTor("|");
                                }
                                else if(powerUp != "Torpedo" && rotateTor=="-")
                                {
                                    setPowerUp("Torpedo");
                                    setRotateTor("-");
                                }
                                else if(powerUp == "Torpedo" && rotateTor=="|")
                                {
                                    setRotateTor("-");
                                }
                                else if(powerUp == "Torpedo" && rotateTor=="-")
                                {
                                    setPowerUp("None")
                                    setRotateTor("Nope");
                                }
                                else
                                {
                                    setPowerUp("Torpedo");
                                    setRotateTor("|");

                                }

                            }}><div
                            className={`${rotateTor=="-" ? "w-8 h-2" : "w-2 h-8"} bg-white text-black  animate-pulse`}
                            style={{ animationDuration: '0.5s' }}
                            ></div>

                        <p className='text-[20px]'>Torpedo</p>
                        <p className='italic text-[10px]'>Attack a whole row</p>                
                        </button>


                    </div>
          
                </div>
            </div>)
    
    
    
    
    
    }
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
                                cell === player.ID
                                    ? "bg-white"
                                    : cell === "Hit" || cell === "Sonar-Hit"
                                    ? "bg-red-500"
                                    : (player.ID !== undefined && (gameState.board.oceans[player.ID][ri][ci] == "Miss" || gameState.board.oceans[player.ID][ri][ci] == "Sonar"))
                                    ?"bg-blue-900"
                                    :"bg-blue-950"
                            } ${player.ID !== undefined &&(gameState.board.oceans[player.ID][ri][ci] === "Sonar" || gameState.board.oceans[player.ID][ri][ci] === "Sonar-Hit") ? "border-2" : ""}`}
                            onClick={() => OnHandleSelfClick(ri, ci)}
                        >
                            {(player.ID !== undefined && gameState.board.oceans[player.ID][ri][ci] === "Sonar" || (player.ID !== undefined && gameState.board.oceans[player.ID][ri][ci] === "Sonar-Hit")) && FindSurroundingShips(ri,ci, true)}
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
    <div className="flex flex-col items-center gap-6 ">
        {/* Ship Placement Info */}
        
        {connect ? (
            <div className="animate-bounce bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-56 mb-35" style={{ animationDuration: '2s' }}>


                {gameState.state !== "Normal" ?

                <div className='text-white'>
                    {player.ID !== undefined && gameState.players[player.ID]?.placedCount > 0
                        ? `Place your ${gameState.players[player.ID]?.placedCount} ships`
                        : "All ships placed!"}
                </div>


                    : <div className='text-white'>
                    {player.ID !== undefined && gameState.currentPlayer == player.ID ? "Your turn!" : "It's your enemies turn!"}
                        
                </div>}
            </div>
        ) : (
            <div className="bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-72 h-56 flex flex-col justify-center mb-15">
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
                            onClick={() => {
                                if (gameState.currentPlayer === player.ID) {
                                    handleShoot(ri, ci);
                                } else {
                                    console.log("nope");
                                }
                            }}
                            className={`w-8 h-8 ${
                                
                                gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Miss"
                                    ? "bg-gray-500"
                                    : gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Hit"
                                    ? "bg-orange-800"
                                    : gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Air"
                                    ? "bg-blue-900"
                                    : gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Sonar"
                                    ? "border-2 border-white bg-gray-500"
                                    : gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Sonar-Hit"
                                    ? "border-2 border- bg-orange-800"
                                    : "bg-blue-900"


                            } opacity-60 text-white rounded-xl ${gameState.currentPlayer === player.ID && "hover:border-2"}`}
                        >
                            {(gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Sonar" || gameState.board.oceans[player.ID === 0 ? 1 : 0][ri][ci] === "Sonar-Hit") && FindSurroundingShips(ri,ci, false)}
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
                <div className="text-white text-2xl w-full flex justify-center items-center h-32 animate-pulse mb-30">
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

