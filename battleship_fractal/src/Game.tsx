import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {  useMutation } from '@tanstack/react-query'
import { useRef } from "react";
import place from "/src/placingBoat.mp3";
import MyTurn from "/src/MyTurn.mp3";
import shotSound from "/src/shot.wav";
import explosionSound from "/src/explosion.wav";
import torpedoExplosion from "/src/torpedo_explosion.wav";



import {emptyOcean, emptyPlayer, type GameState, initialGameState, type Board, placeBoat, type Player} from './logic'




type GameProps = {
    RealName: string;
    RealGameCode: string;
    RealID: number
};

function Game({
    RealName,
    RealGameCode,
    RealID,

}: GameProps) {
    type ShootRequest = { row: number; col: number; id: number, powerUp: string, gameCode: string};

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [connect, setConnected] = useState(false);
  const [waitingConnect, setWaitingConnection] = useState(false);

  const [playerID, setPlayer] = useState<number>(RealID);
  
  const [finishedplacing, setFinishedPlacing] = useState(false);
  const [ocean, setOcean] = useState<Board>(emptyOcean);
  const [rotate, setRotate] = useState(false);

  const [rotateTor, setRotateTor] = useState<String>("Nope");
const Rname = RealName;
const RGame = RealGameCode;
  const [powerUp, setPowerUp] = useState("None");
  const audioRef = useRef<HTMLAudioElement | null>(null);  
  const audioRefPlace = useRef<HTMLAudioElement | null>(null);
    const audioRefShot = useRef<HTMLAudioElement | null>(null);
    const audioRefExplode = useRef<HTMLAudioElement | null>(null);
    const audioRefTorpExplode = useRef<HTMLAudioElement | null>(null);




  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // restart from beginning
      audioRef.current.play();
    }
  };const playPlace = () => {
    if (audioRefPlace.current) {
      audioRefPlace.current.currentTime = 0; // restart from beginning
      audioRefPlace.current.play();
    }
  };

  const playShot = () => {
    if (audioRefShot.current) {
                    audioRefShot.current.volume = 0.01;    // set volume (50%)

      audioRefShot.current.currentTime = 0; // restart from beginning
      audioRefShot.current.play();
    }
  };

  const playExplode = () => {
    if (audioRefExplode.current) {
            audioRefExplode.current.volume = 0.01;    // set volume (50%)

      audioRefExplode.current.currentTime = 0; // restart from beginning
      audioRefExplode.current.play();
    }
  };

  const playTorpExplode = () => {
    if (audioRefTorpExplode.current) {
            audioRefTorpExplode.current.volume = 0.01;    // set volume (50%)

      audioRefTorpExplode.current.currentTime = 0; // restart from beginning
      audioRefTorpExplode.current.play();
    }
  };



  const [name, setName] = useState<string>('');
  const [gameCode, setGameCode] = useState<number>();


    async function getGame(): Promise<GameState> {
        const res = await fetch("/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameCode: RealGameCode }),
        });
        const data = await res.json();
        console.log(data);
        setGameState(data.gameState);
        return data.gameState;
    }

    async function finishedPlacing(): Promise<void> {

        play();
            await fetch(`/finishedPlacing/${RealGameCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        }
    

    async function placingBoat(params: { row: number, col: number, gameCode: string }) {
        playPlace();
        const res = await fetch(`/placeboat/${playerID}`, {
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
        return await fetch(`/updatedPlaceCount/${playerID}/${RealGameCode}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }

    async function handleShoot(ri: number, ci: number) {
        playShot();

        if (playerID === undefined && gameState.currentPlayer != playerID) {
            console.warn("No player ID yet; can’t shoot.");
            return;
        }
        try {
            if(playerID == undefined)
            {
                return;
            }

            if(powerUp == "Torpedo")
            {
                playTorpExplode();
                if(rotateTor == "|")
                {
                    for(let num = 0; num < 10; num++)
                    {
                        await shooting({ row: num, col: ci, id: playerID, powerUp: powerUp, gameCode: RealGameCode });
                    }
                }
                if(rotateTor == "-")
                {
                    for(let num = 0; num < 10; num++)
                    {
                        await shooting({ row: ri, col: num, id: playerID, powerUp: powerUp, gameCode: RealGameCode });
                    }
                }

            }
            if(powerUp == "Bomb")
            {   
                playExplode();
                    for(let numR = -1; numR < 2; numR++)
                    {

                            await shooting({ row: ri+numR, col: ci, id: playerID, powerUp: powerUp, gameCode: RealGameCode });                            
                            await shooting({ row: ri+numR, col: ci-1, id: playerID, powerUp: powerUp, gameCode: RealGameCode });                            
                            await shooting({ row: ri+numR, col: ci+1, id: playerID, powerUp: powerUp, gameCode: RealGameCode });

                    }
                    
            }
            else
            {
                playShot();
                await shooting({ row: ri, col: ci, id: playerID, powerUp: powerUp, gameCode: RealGameCode });
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
    if (playerID === undefined || !gameState.players[playerID]) return;


    if (gameState.players[playerID].placedCount + y > 10) return;


        for (let i = 0; i < gameState.players[playerID].placedCount; i++) 
        {
            if(typeof gameState.board.oceans[playerID][x][y+i] == "number")
            {
                return;
            }

        }

        for (let i = 0; i < gameState.players[playerID].placedCount; i++) 
        {
            mutation.mutate({ row: x, col: y + i, gameCode: RealGameCode });
        }
    } 
    else {
        if (playerID === undefined || !gameState.players[playerID]) return;

        if (gameState.players[playerID].placedCount + x > 10) return;



        for (let i = 0; i < gameState.players[playerID].placedCount; i++) 
        {
            if(typeof gameState.board.oceans[playerID][x+i][y] == "number")
            {
                return;
            }

        }


        for (let i = 0; i < gameState.players[playerID].placedCount; i++) 
        {
            mutation.mutate({ row: x + i, col: y, gameCode: RealGameCode });

        }
  }

  let next = 0;
  if (playerID !== undefined && gameState.players[playerID]) {
    next = gameState.players[playerID].placedCount - 1;
    console.log("updating placecount")
    await updatedPlaceCount();   

    console.log(next)
    if (next == 1) {
    
      console.log("Finishing placing")

      await finishedPlacing();    
    }
  }
};




    
        function FindSurroundingShips (ri: number, ci: number, Me: boolean): String
        {

            let numShipsDetect = 0;

            let ID = 1;

            if(Me)
            {
                ID = playerID !== undefined ? playerID : 0;
            }
            
  
            for(let row = -1; row < 2; row++)
            {
                for(let col = -1; col < 2; col++)
                {
                    if (row === 0 && col === 0) continue;

                    if(gameState.board.oceans[ID][ri+row][ci+col] == 1 || gameState.board.oceans[ID][ri+row][ci+col] == 0)
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
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-300 to-blue-400 flex flex-col gap-1 items-center justify-center">
    <h1 className="text-9xl font-bold text-white mb-6 absolute top-10">
        BattleShip 🚢
    </h1>
        <audio ref={audioRefPlace} src={place}></audio>
        <audio ref={audioRef} src={MyTurn}></audio>
        <audio ref={audioRefShot} src={shotSound}></audio>
        <audio ref={audioRefExplode} src={explosionSound}></audio>
        <audio ref={audioRefTorpExplode} src={torpedoExplosion}></audio>




  <div className="flex flex-col items-end absolute top-3 right-3 gap-2">

   


    {waitingConnect && <div className=' text-white'>Waiting for another player...</div>}


      
  </div>
  <div className={`flex ${rotate ? "flex-col" : "flex-row"} gap-1 ml-2 absolute top-30 left-50`}>

    {playerID !== undefined && gameState?.players[playerID] &&
      Array.from({length: gameState.players[playerID].placedCount}, (_,i) => (
        <button
        key={i}
        className={`w-8 h-8 bg-white text-white rounded-xl animate-pulse  ${i === 0 ? "border-5 border-blue-950 bg-blue-950" : "bg-white"}`}
        style={{ animationDuration: '0.5s' }}
        onClick={i === 0 ? () => setRotate(!rotate) : undefined}
        ></button>
      ))
    }



</div>

  {gameState.currentPlayer === playerID && (<div className=" bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-140" style={{ animationDuration: '2s' }}>



                <div className='text-white flex flex-col gap-3'>
                    <div>
                    
                    <h2 className="text-2xl font-bold mb-2 text-white">Shop</h2>
                    <div>${playerID !== undefined ? gameState.players[playerID].money : ""}</div>
                    </div>
                    <div className='flex flex-row gap-10'>

                        <button className={`flex flex-col gap-2 items-center rounded-2xl p-4 w-40 hover:bg-sky-700 ${powerUp=="Sonar" ? "bg-sky-700" : ""}`} onClick={() => 
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
                    }}>
                        <div
                            className={`w-8 h-8 bg-white text-black rounded-xl animate-pulse`}
                            style={{ animationDuration: '0.5s' }}
                            
                            >?</div>

                        <p className='text-[20px]'>Sonar</p>
                        <p className='italic text-[10px]'>Detect surrounding ships</p>                
                        </button>
                        <button className={`flex flex-col gap-2 items-center rounded-2xl p-4 w-40 hover:bg-sky-700 ${powerUp=="Bomb" ? "bg-sky-700" : ""}`} onClick={() => 
                        { 
                            setRotateTor("|");
                            if(powerUp=="Bomb") 
                                { 
                                    setPowerUp("None")
                                } 
                            else 
                            {
                            setPowerUp("Bomb");
                            }
                    }}>
                        <div
                            className={`w-8 h-8 bg-black text-black border-2 border-white rounded-full animate-pulse`}
                            style={{ animationDuration: '0.5s' }}
                            
                            ></div>

                        <p className='text-[20px]'>Bomb</p>
                        <p className='italic text-[10px]'>Destory everything in a one block radius</p>                
                        </button>




                        <button className={`flex flex-col gap-2 items-center rounded-2xl p-4 w-40 hover:bg-sky-700 ${powerUp=="Torpedo" && "bg-sky-700 "}`} onClick={() => {
                                
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
        {playerID !== undefined && gameState.board.oceans[playerID] ? (
            gameState.board.oceans[playerID].map((row, ri) => (
                <div key={ri} className="flex gap-1">
                    {row.map((cell, ci) => (
                        <button
                            key={ci}
                            className={`w-8 h-8 text-white rounded-xl ${
                                cell === playerID
                                    ? "bg-white"
                                    : cell === "Hit" || cell === "Sonar-Hit"
                                    ? "bg-red-500"
                                    : (playerID !== undefined && (gameState.board.oceans[playerID][ri][ci] == "Miss" || gameState.board.oceans[playerID][ri][ci] == "Sonar"))
                                    ?"bg-blue-900"
                                    :"bg-blue-950"
                            } ${playerID !== undefined &&(gameState.board.oceans[playerID][ri][ci] === "Sonar" || gameState.board.oceans[playerID][ri][ci] === "Sonar-Hit") ? "border-2" : ""}`}
                            onClick={() => OnHandleSelfClick(ri, ci)}
                        >
                            {(playerID !== undefined && gameState.board.oceans[playerID][ri][ci] === "Sonar" || (playerID !== undefined && gameState.board.oceans[playerID][ri][ci] === "Sonar-Hit")) && FindSurroundingShips(ri,ci, true)}
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
        
        {gameState.state ? (
            <div className="animate-bounce bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-80 mb-35" style={{ animationDuration: '2s' }}>


                {gameState.state !== "Normal" ?

                <div className='text-white text-2xl font-bold'>
                    {playerID !== undefined && gameState.players[playerID]?.placedCount > 0
                        ? `Place your ${gameState.players[playerID]?.placedCount} ships`
                        : "All ships placed!"}
                </div>


                    : <div className='text-white text-2xl font-bold'>
                    {playerID !== undefined && gameState.currentPlayer == playerID ? "Your turn!" : "It's your enemies turn!"}
                        
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
        {playerID !== undefined && gameState.board.oceans[playerID === 0 ? 1 : 0] ? (
            gameState.board.oceans[playerID === 0 ? 1 : 0].map((row, ri) => (
                <div key={ri} className="flex gap-1">
                    {row.map((cell, ci) => (
                        <button
                            key={ci}
                            onClick={() => {
                                if (gameState.currentPlayer === playerID) {
                                    handleShoot(ri, ci);
                                } else {
                                    console.log("nope");
                                }
                            }}
                            className={`w-8 h-8 ${
                                
                                gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Miss"
                                    ? "bg-gray-500"
                                    : gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Hit"
                                    ? "bg-orange-800"
                                    : gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Air"
                                    ? "bg-blue-900"
                                    : gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Sonar"
                                    ? "border-2 border-white bg-gray-500"
                                    : gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Sonar-Hit"
                                    ? "border-2 border- bg-orange-800"
                                    : "bg-blue-900"


                            } opacity-60 text-white rounded-xl ${gameState.currentPlayer === playerID && "hover:border-2"}`}
                        >
                            {(gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Sonar" || gameState.board.oceans[playerID === 0 ? 1 : 0][ri][ci] === "Sonar-Hit") && FindSurroundingShips(ri,ci, false)}
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

