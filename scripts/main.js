const GameBoardCellStatus = {
    Empty: "E",
    PlayerOne: "X",
    PlayerTwo: "O"
}

const GameState = {
    Playing: "Playing",
    Win: "Win",
    Tied: "Tied"
}

function createPlayer(displayName, token) {
    let name = displayName;

    const getName = () => name;

    const setName = (newName) => {
        name = newName;
    }

    const getToken = () => token;

    return {getName, setName, getToken};
}

function createGameController() {
    const gameBoard = (() => {
        const grid = [
            [GameBoardCellStatus.Empty, GameBoardCellStatus.Empty, GameBoardCellStatus.Empty],
            [GameBoardCellStatus.Empty, GameBoardCellStatus.Empty, GameBoardCellStatus.Empty],
            [GameBoardCellStatus.Empty, GameBoardCellStatus.Empty, GameBoardCellStatus.Empty]
        ];

        const setCell = (x, y, cellStatus) => {
            if(grid[y][x] !== GameBoardCellStatus.Empty) {
                return false;
            }
            grid[y][x] = cellStatus;

            return true;
        };

        const getGrid = () => grid;

        const resetBoard = () => {
            for(let y = 0; y < 3; y++) {
                for(let x = 0; x < 3; x++) {
                    grid[x][y] = GameBoardCellStatus.Empty;
                }
            }
        }

        return { setCell, getGrid, resetBoard };
    })();

    const playerOne = createPlayer("Player One", GameBoardCellStatus.PlayerOne);
    const playerTwo = createPlayer("Player Two", GameBoardCellStatus.PlayerTwo);
    let currentPlayer = playerOne;
    let gameState = GameState.Playing;

    const updatePlayerName = (playerIndex, newName) => {
        if(playerIndex === 0) {
            playerOne.setName(newName);
        } else {
            playerTwo.setName(newName);
        }
    };

    const getPlayerName = (playerIndex) => {
        if(playerIndex === 0) {
            return playerOne.getName();
        }
        
        return playerTwo.getName();
    }

    const switchCurrentPlayer = () => {
        if(currentPlayer === playerOne) {
            currentPlayer = playerTwo;
        } else {
            currentPlayer = playerOne;
        }
    };

    const getCurrentPlayerName = () => currentPlayer.getName();

    const restartGame = () => {
        gameBoard.resetBoard();
        gameState = GameState.Playing;
    }

    const playTurn = (x, y) => {
        if(!gameBoard.setCell(x, y, currentPlayer.getToken())) {
            console.log(`Can not place cell on ( ${x} | ${y} ) cell is already occupied (${gameBoard.getGrid()[y][x]})`);
            return;
        }

        if(checkWinCondition()) {
            console.log(`${getCurrentPlayerName()} has won the game!`);
            gameState = GameState.Win;
            return;
        }

        if(checkTieCondition()) {
            console.log("No more empty cells! The game ends in a tie!");
            gameState = GameState.Tied;
            return;
        }

        switchCurrentPlayer();
    }

    const checkWinCondition = () => {
        const grid = gameBoard.getGrid();

        for(let i = 0; i < 3; i++) {
            if(checkRowForWin(i)) {
                return true;
            }

            if(checkColumnForWin(i)) {
                return true;
            }
        }

        if(checkDiagonalsForWin(grid)) {
            return true;
        }

        return false;

        function checkRowForWin(rowIndex) {
            return checkCellsForWin(grid[rowIndex]);
        }

        function checkColumnForWin(columnIndex) {
            const column = [ grid[0][columnIndex], grid[1][columnIndex], grid[2][columnIndex] ];
            return checkCellsForWin(column);
        }

        function checkDiagonalsForWin() {
            const topLeftBotRight = [ grid[0][0], grid[1][1], grid[2][2] ];
            if(checkCellsForWin(topLeftBotRight)) {
                return true;
            }
            const botLeftTopRight = [ grid[0][2], grid[1][1], grid[2][0] ];
            return checkCellsForWin(botLeftTopRight);
        }

        function checkCellsForWin(cells) {
            return cells.every(value => value !== GameBoardCellStatus.Empty && value === cells[0]);
        }
    }

    const checkTieCondition = () => {
        return !containsEmptyCell(gameBoard.getGrid());

        function containsEmptyCell(array) {
            return array.some(function(entry) {
                if(Array.isArray(entry)) {
                    return containsEmptyCell(entry);
                }

                return entry === GameBoardCellStatus.Empty;
            });
        }
    }

    const getGrid = () => gameBoard.getGrid();
    const getGameState = () => gameState;

    return { updatePlayerName, getPlayerName, getCurrentPlayerName, restartGame, playTurn, getGrid, getGameState };
}

const screenController = (() => {
    const game = createGameController();
    const turnIndicatorDiv = document.querySelector("#turn-indicator");
    const gameBoardDiv = document.querySelector("#game-board");
    const restartButtonContainer = document.querySelector("#restart-button-container");
    const restartButton = document.querySelector("#restart-button");
    
    const changePlayerOneButton = document.querySelector("#change-player-one-name-button");
    const playerOneNameInput = document.querySelector("#player-one-name");
    const confirmPlayerOneButton = document.querySelector("#confirm-player-one");
    
    const changePlayerTwoButton = document.querySelector("#change-player-two-name-button");
    const playerTwoNameInput = document.querySelector("#player-two-name");
    const confirmPlayerTwoButton = document.querySelector("#confirm-player-two");
    
    gameBoardDiv.addEventListener("click", onGameBoardButtonClicked);
    restartButton.addEventListener("click", onRestartButtonClicked);

    changePlayerOneButton.addEventListener("click", () => toggleChangePlayerNameEditState(0, true, changePlayerOneButton, playerOneNameInput, confirmPlayerOneButton));
    confirmPlayerOneButton.addEventListener("click", () => toggleChangePlayerNameEditState(0, false, changePlayerOneButton, playerOneNameInput, confirmPlayerOneButton));
    playerOneNameInput.addEventListener("keyup", (keyupEvent) => handlePlayerNameInputConfirm(keyupEvent, 0, changePlayerOneButton, playerOneNameInput, confirmPlayerOneButton));

    changePlayerTwoButton.addEventListener("click", () => toggleChangePlayerNameEditState(1, true, changePlayerTwoButton, playerTwoNameInput, confirmPlayerTwoButton));
    confirmPlayerTwoButton.addEventListener("click", () => toggleChangePlayerNameEditState(0, false, changePlayerTwoButton, playerTwoNameInput, confirmPlayerTwoButton));
    playerTwoNameInput.addEventListener("keyup", (keyupEvent) => handlePlayerNameInputConfirm(keyupEvent, 1, changePlayerTwoButton, playerTwoNameInput, confirmPlayerTwoButton));
    
    const updateScreen = () => {
        gameBoardDiv.textContent = "";
        
        const grid = game.getGrid();
        
        for(let y = 0; y < 3; y++) {
            for(let x = 0; x < 3; x++) {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.x = x;
                cellButton.dataset.y = y;
                const gridValue = grid[y][x];
                cellButton.textContent = grid[y][x] === GameBoardCellStatus.Empty ? "" : grid[y][x];
                if(gridValue !== GameBoardCellStatus.Empty) {
                    cellButton.dataset.token = gridValue;
                }
                gameBoardDiv.appendChild(cellButton);
            }
        }

        const gameState = game.getGameState();

        switch(gameState) {
            case GameState.Playing:
                turnIndicatorDiv.textContent = `${game.getCurrentPlayerName()}'s turn...`;
                break;
            case GameState.Win:
                turnIndicatorDiv.textContent = `${game.getCurrentPlayerName()} has won the game!`;
                break;
            case GameState.Tied:
                turnIndicatorDiv.textContent = "Game ended in a Tie!"
                break;
            default:
                turnIndicatorDiv.textContent = "ERROR: Unknown Game State!"
                break;
        }

        if(gameState === GameState.Playing) {
            if(!restartButtonContainer.classList.contains("hidden")) {
                restartButtonContainer.classList.add("hidden");
            }
        } else {
            if(restartButtonContainer.classList.contains("hidden")) {
                restartButtonContainer.classList.remove("hidden");
            }
        }
    }
    
    function onGameBoardButtonClicked(clickEvent) {
        if(!clickEvent.target.classList.contains("cell") || game.getGameState() !== GameState.Playing) {
            return;
        }
        
        const turnResult = game.playTurn(clickEvent.target.dataset.x, clickEvent.target.dataset.y);
        updateScreen();
    }

    function onRestartButtonClicked() {
        playerOneNameInput.value = game.getPlayerName(0);
        playerTwoNameInput.value = game.getPlayerName(1);
        game.restartGame();
        updateScreen();
    }

    function toggleChangePlayerNameEditState(playerIndex, enableEdit, changeNameButton, nameInput, confirmButton) {
        if(enableEdit) {
            changeNameButton.setAttribute("disabled", "");
            nameInput.removeAttribute("disabled");
            confirmButton.removeAttribute("disabled");
        } else {
            changeNameButton.removeAttribute("disabled");
            nameInput.setAttribute("disabled", "");
            confirmButton.setAttribute("disabled", "");

            game.updatePlayerName(playerIndex, nameInput.value);
            updateScreen();
        }
    }

    function handlePlayerNameInputConfirm(keyupEvent, playerIndex, changeNameButton, nameInput, confirmButton) {
        if(keyupEvent.key === "Enter") {
            toggleChangePlayerNameEditState(playerIndex, false, changeNameButton, nameInput, confirmButton);
        }
    }
    
    onRestartButtonClicked();
    return { updateScreen }
})();
