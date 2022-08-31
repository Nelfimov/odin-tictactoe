const gameItems = {
  X: 'static/x.svg',
  O: 'static/o.svg',
}
const winningCombos = [
  [0, 1, 2],
  [0, 3, 6],
  [3, 4, 5],
  [6, 7, 8],
  [1, 4, 7],
  [2, 4, 6],
  [2, 5, 8],
  [0, 4, 8],
]

const playerFactory = function (name) {
  const getName = () => name;
  let score = 0;
  const getScore = () => score;
  const win = () => ++score;
  return { getName, getScore, win };
}

// Creating two players from factory
const player1 = playerFactory(prompt('Please insert your name'));
const player2 = playerFactory('Computer');

// Gamboard module
const gameBoard = (() => {
  let gameField = new Array(9);
  const getGameField = () => gameField;

  // Function to change announcement at the top of the page
  const changeAnnouncement = (string) => {
    document.getElementById('announcement').textContent = string;
  }

  const getPlayerScore = () => document.querySelectorAll('div.player-score>p');
  const getFields = () => document.querySelectorAll('div.field');

  // Remove all items from gamefield
  const reset = () => {
    getFields().forEach((field) => {
      field.innerHTML = '';
      field.addEventListener('click', () => turn(field))
    });
    gameField = [];
    changeAnnouncement('Play the game!');
  }

  // Turn function
  const turn = field => {
    if (field.hasChildNodes()) {
      changeAnnouncement('This field is already taken!');
      return;
    } else {
      const img = document.createElement('img');
      gameField[field.id] = 'X';
      img.src = gameItems['X'];
      img.setAttribute('class', 'item');
      field.appendChild(img);

      if (check(gameField[field.id])) {
        player1.win();
        getPlayerScore()[0].textContent = player1.getScore();
        changeAnnouncement(`${player1.getName()} wins!`)
        stop();
      } else {
        if (document.querySelectorAll('img.item').length < 9) {
          changeAnnouncement('Next turn');
          opponentTurn();
        } else {
          changeAnnouncement('Draw');
          stop();
        }
      }
    }
  }

  // AI turn function
  const opponentTurn = () => {
    const getCoordinate = () => Math.floor(Math.random() * 9);
    let coordinate;
    while (true) {
      coordinate = getCoordinate();
      if (!document.getElementById(coordinate).hasChildNodes()) break;
    }
    gameField[coordinate] = 'O';

    const img = document.createElement('img');
    img.setAttribute('class', 'item');
    img.src = gameItems['O'];
    document.getElementById(coordinate).appendChild(img);

    if (check(gameField[coordinate])) {
      player2.win();
      getPlayerScore()[1].textContent = player2.getScore();
      changeAnnouncement(`${player2.getName()} wins!`)
      stop();
    } else {
      changeAnnouncement('Next turn');
    }
  }

  // Check current gamefield situation for containing winning combo
  const check = (value) => {
    let playerArray = [...getGameField()].map((element, index) => element == value ? index : null)
      .filter((element) => element != null);
    return winningCombos.some((combo) => playerArray.join(',')
      .includes(combo.join(',')));
  }

  // Get remaining empty fields
  const getEmptyFields = () => {
    let emptyFields = getGameField().map((element, index) => typeof element === 'undefined' ? index : undefined);
    console.log(emptyFields);
    return emptyFields.filter((element) => typeof element !== 'undefined');
  }

  // Function to stop the game and remove all eventlisteners
  const stop = () => {
    getFields().forEach((field) => {
      let newField = field.cloneNode(true);
      field.parentNode.replaceChild(newField, field);
    });
  }

  return { reset, turn, getGameField, getEmptyFields };
})();

const minimaxAiLogic = ((percentage) => {
  let aiPrecision = percentage;
  const setAiPercentage = (percentage) => aiPrecision = percentage;
  const getAiPercentage = () => aiPrecision;

  /**
   * Chooses the next filed for the AI Player.
   * The AI player has an 'aiPercentage' value, this function chooses the best move proportionate to that value,
   * and chooses a random move the rest of the time.
   * For example if the 'aiPercentage' is 64 then the probability of the best move is 0.64 and the probability of a random move is 0.36
   */
  const chooseField = () => {

    //random number between 0 and 100
    const value = Math.floor(Math.random() * (100 + 1));

    // if the random number is smaller then the AIs threshold, it finds the best move
    let choice = null;
    if (value <= aiPrecision) {
      console.log('bestChoice');
      choice = minimax(gameBoard, gameController.getAiPlayer()).index
      const field = gameBoard.getField(choice);
      if (field != undefined) {
        return "error"
      }
    }
    else {
      console.log('NotbestChoice');
      const emptyFieldsIdx = gameBoard.getEmptyFieldsIdx();
      let noBestMove = Math.floor(Math.random() * emptyFieldsIdx.length);
      choice = emptyFieldsIdx[noBestMove];
    }
    return choice;
  }


  const findBestMove = (moves, player) => {
    let bestMove;
    if (player === gameController.getAiPlayer()) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];

  }

  /**
   * Returns an object which includes the 'index' and the 'score' of the next best move
   * @param {gameBoard} newBoard - call it with the gameBoard
   * @param {player} player - call it with the AI player
   */
  const minimax = (newBoard, player) => {

    let empty = newBoard.getEmptyFieldsIdx();

    if (gameController.checkForDraw(newBoard)) {
      return {
        score: 0
      };
    }
    else if (gameController.checkForWin(newBoard)) {

      if (player.getSign() == gameController.getHumanPlayer().getSign()) {
        return {
          score: 10
        };
      }
      else if (player.getSign() == gameController.getAiPlayer().getSign()) {
        return {
          score: -10
        };
      }
    }

    let moves = [];

    for (let i = 0; i < empty.length; i++) {
      let move = {};
      move.index = empty[i];

      //Change the field value to the sign of the player
      newBoard.setFieldForAiLogic(empty[i], player);

      //Call the minimax with the opposite player
      if (player.getSign() == gameController.getAiPlayer().getSign()) {
        let result = minimax(newBoard, gameController.getHumanPlayer());
        move.score = result.score;
      }
      else {
        let result = minimax(newBoard, gameController.getAiPlayer());
        move.score = result.score;
      }

      //Reset the filed value set before
      newBoard.setFieldForAiLogic(empty[i], undefined);

      moves.push(move);
    }

    //find the best move
    return findBestMove(moves, player);

  }
  return {
    minimax,
    chooseField,
    getAiPercentage,
    setAiPercentage
  }
})(0);


document.querySelector('button.restart').addEventListener('click', gameBoard.reset)
document.querySelectorAll('div.field').forEach((field) =>
  field.addEventListener('click', () => gameBoard.turn(field))
);

const playerNames = document.querySelectorAll('div.player-score>h3');
playerNames[0].textContent = player1.getName();
playerNames[1].textContent = player2.getName();
