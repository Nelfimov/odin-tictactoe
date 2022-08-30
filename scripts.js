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
  [0, 4, 8]
]

const playerFactory = function (name) {
  const getName = () => name;
  let score = 0;
  const getScore = () => score;
  const win = () => ++score;
  return { getName, getScore, win };
}

const player1 = playerFactory(prompt('Please insert your name'));
const player2 = playerFactory('Computer');

const gameBoard = (() => {
  let gameField = [];
  const getGameField = () => gameField;

  const changeAnnouncement = (string) => {
    document.getElementById('announcement').textContent = string;
  }

  const getPlayerScore = () => document.querySelectorAll('div.player-score>p');
  const getFields = () => document.querySelectorAll('div.field');

  const reset = () => {
    getFields().forEach((field) => {
      field.innerHTML = '';
      field.addEventListener('click', () => turn(field))
    });
    gameField = [];
    changeAnnouncement('Play the game!');
  }

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

  const check = (value) => {
    let playerArray = [...getGameField()].map((element, index) => element == value ? index : null)
      .filter((element) => element != null);
    return winningCombos.some((combo) => playerArray.join(',')
      .includes(combo.join(',')));
  }

  const emptyFields = () => getGameField().filter(f => typeof f == 'string');

  const stop = () => {
    getFields().forEach((field) => {
      let newField = field.cloneNode(true);
      field.parentNode.replaceChild(newField, field);
    });
  }

  return { reset, turn, getGameField, emptyFields };
})();

document.querySelector('button.restart').addEventListener('click', gameBoard.reset)
document.querySelectorAll('div.field').forEach((field) =>
  field.addEventListener('click', () => gameBoard.turn(field))
);

const playerNames = document.querySelectorAll('div.player-score>h3');
playerNames[0].textContent = player1.getName();
playerNames[1].textContent = player2.getName();
