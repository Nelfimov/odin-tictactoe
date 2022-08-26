const gameItems = {
  'X': 'static/x.svg',
  'O': 'static/o.svg',
}


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
  let gameField = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']];
  const getGameField = () => gameField;
  let turnSwitcher = true;

  const changeAnnouncement = string => {
    document.querySelector('div.announcement>h2').textContent = string;
  }

  const getFields = () => document.querySelectorAll('div.field');

  const reset = () => {
    getFields().forEach(field => {
      field.innerHTML = '';
      field.addEventListener('click', () => turn(field))
    });
    gameField = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']];
    turnSwitcher = true;
    changeAnnouncement('Play the game!');
  }

  const turn = field => {
    if (field.hasChildNodes()) {
      changeAnnouncement('This field is already taken!');
    } else {
      const img = document.createElement('img');
      let classField = field.getAttribute('class').split(' ')[1];
      classField = classField.split('-');

      if (turnSwitcher) {
        gameField[classField[0]][classField[1]] = 'X';
        img.src = gameItems['X'];
      } else {
        gameField[classField[0]][classField[1]] = 'O';
        img.src = gameItems['O'];
      }

      img.setAttribute('class', 'item');
      field.appendChild(img);

      check(gameField[classField[0]][classField[1]]);
    }
  }

  const check = (value) => {
    getGameField().forEach((field, index) => {
      if (field.every(item => item === value)) {
        switch (turnSwitcher) {
          case true:
            player1.win();
            changeAnnouncement('Player 1 wins');
            break;
          case false:
            player2.win();
            changeAnnouncement('Player 2 wins!');
            break;
        }
        stop();
      } else {
        announcement = 'Next turn';
        turnSwitcher ? turnSwitcher = false : turnSwitcher = true;
      }
    })
  }

  const stop = () => {
    getFields().forEach(field => {
      let newField = field.cloneNode(true);
      field.parentNode.replaceChild(newField, field);
    });
  }

  return { reset, turn, getGameField };
})();


document.querySelector('button.restart').addEventListener('click', gameBoard.reset)
document.querySelectorAll('div.field').forEach(field => field.addEventListener('click', () => gameBoard.turn(field)));