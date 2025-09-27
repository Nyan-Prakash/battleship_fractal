{gameState.currentPlayer === playerID && (
          <div
            className=" bg-blue-950 p-5 rounded-2xl opacity-100 text-center shadow-lg w-140 h-50 mt-3 mb-0"
            style={{ animationDuration: "2s" }}
          >
            <div className="text-white flex flex-col gap-3 pt-0 mt-0">
              <div className="flex flex-row items-center gap-3 justify-center pt-0 mt-0">
                <h2 className="text-2xl font-bold mb-0 text-white">Shop</h2>
                <div>
                  $
                  {playerID !== undefined
                    ? gameState.players[playerID].money
                    : ""}
                </div>
              </div>
              <div className="flex flex-row gap-10">
                <button
                  className={`flex flex-col gap-2 items-center rounded-2xl p-3 w-40 ${
                    gameState.players[playerID].money >= SCost
                      ? "hover:bg-sky-700"
                      : "hover:bg-gray-500"
                  } ${powerUp == "Sonar" ? "bg-sky-700" : ""}`}
                  onClick={() => {
                    if (gameState.players[playerID].money >= SCost) {
                      setRotateTor("|");
                      if (powerUp == "Sonar") {
                        setPowerUp("None");
                      } else {
                        setPowerUp("Sonar");
                      }
                    }
                  }}
                >
                  <div
                    className={`w-8 h-8 bg-white text-black rounded-xl animate-pulse`}
                    style={{ animationDuration: "0.5s" }}
                  >
                    ?
                  </div>

                  <p className="text-[20px]">Sonar - 2</p>
                  <p className="italic text-[10px]">Detect surrounding ships</p>
                </button>
                <button
                  className={`flex flex-col gap-2 items-center rounded-2xl p-3 w-40 ${
                    gameState.players[playerID].money >= BCost
                      ? "hover:bg-sky-700"
                      : "hover:bg-gray-500"
                  } ${powerUp == "Bomb" ? "bg-sky-700" : ""}`}
                  onClick={() => {
                    if (gameState.players[playerID].money >= BCost) {
                      setRotateTor("|");
                      if (powerUp == "Bomb") {
                        setPowerUp("None");
                      } else {
                        setPowerUp("Bomb");
                      }
                    }
                  }}
                >
                  <div
                    className={`w-8 h-8 bg-black text-black border-2 border-white rounded-full animate-pulse`}
                    style={{ animationDuration: "0.5s" }}
                  ></div>

                  <p className="text-[20px]">Bomb - 5</p>
                  <p className="italic text-[10px]">
                    Destory everything around
                  </p>
                </button>

                <button
                  className={`flex flex-col gap-2 items-center rounded-2xl p-4 w-40 ${
                    gameState.players[playerID].money >= TCost
                      ? "hover:bg-sky-700"
                      : "hover:bg-gray-500"
                  } ${powerUp == "Torpedo" && "bg-sky-700 "}`}
                  onClick={() => {
                    if (gameState.players[playerID].money >= TCost) {
                      if (powerUp != "Torpedo" && rotateTor == "|") {
                        setPowerUp("Torpedo");
                        setRotateTor("|");
                      } else if (powerUp != "Torpedo" && rotateTor == "-") {
                        setPowerUp("Torpedo");
                        setRotateTor("-");
                      } else if (powerUp == "Torpedo" && rotateTor == "|") {
                        setRotateTor("-");
                      } else if (powerUp == "Torpedo" && rotateTor == "-") {
                        setPowerUp("None");
                        setRotateTor("Nope");
                      } else {
                        setPowerUp("Torpedo");
                        setRotateTor("|");
                      }
                    }
                  }}
                >
                  <div
                    className={`${
                      rotateTor == "-" ? "w-8 h-2" : "w-2 h-8"
                    } bg-white text-black  animate-pulse`}
                    style={{ animationDuration: "0.5s" }}
                  ></div>

                  <p className="text-[20px]">Torpedo - 6</p>
                  <p className="italic text-[10px]">Attack a whole row</p>
                </button>
              </div>
            </div>
          </div>
        )}