const GameBoardCellStatus = {
    Empty: "E",
    PlayerOne: "X",
    PlayerTwo: "O"
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

    const playerOne = createPlayer("PlayerOne", GameBoardCellStatus.PlayerOne);
    const playerTwo = createPlayer("PlayerTwo", GameBoardCellStatus.PlayerTwo);
    let currentPlayer = playerOne;

    const updatePlayerName = (playerNumber, newName) => {
        if(playerNumber === 1) {
            playerOne.setName(newName);
        } else {
            playerTwo.setName(newName);
        }
    };

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
        console.log(`It is ${getCurrentPlayerName()}'s turn.`);
    }

    const playTurn = (x, y) => {
        if(!gameBoard.setCell(x, y, currentPlayer.getToken())) {
            console.log(`Can not place cell on ( ${x} | ${y} ) cell is already occupied (${gameBoard.getGrid()[y][x]})`);
            return;
        }

        if(checkWinCondition()) {
            gameBoard.printGrid();
            console.log(`${getCurrentPlayerName()} has won the game!`);
            return;
        }

        if(checkTieCondition()) {
            gameBoard.printGrid();
            console.log("No more empty cells! The game ends in a tie!");
            return;
        }

        switchCurrentPlayer();
        gameBoard.printGrid();
        console.log(`It is ${getCurrentPlayerName()}'s turn.`);
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

    return { updatePlayerName, getCurrentPlayerName, restartGame, playTurn, getGrid };
}

const screenController = (() => {
    const game = createGameController();
    const turnIndicatorDiv = document.querySelector("#turn-indicator");
    const gameBoardDiv = document.querySelector("#game-board");
    
    gameBoardDiv.addEventListener("click", onGameBoardButtonClicked);
    
    const updateScreen = () => {
        gameBoardDiv.textContent = "";
        
        const grid = game.getGrid();
        
        for(let y = 0; y < 3; y++) {
            for(let x = 0; x < 3; x++) {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.x = x;
                cellButton.dataset.y = y;
                cellButton.textContent = grid[y][x];
                gameBoardDiv.appendChild(cellButton);
            }
        }

        turnIndicatorDiv.textContent = `${game.getCurrentPlayerName()}'s turn...`;
    }
    
    function onGameBoardButtonClicked(clickEvent) {
        if(!clickEvent.target.classList.contains("cell")) {
            return;
        }
        
        game.playTurn(clickEvent.target.dataset.x, clickEvent.target.dataset.y);
        updateScreen();
    }
    
    game.restartGame();
    return { updateScreen }
})();

screenController.updateScreen();
