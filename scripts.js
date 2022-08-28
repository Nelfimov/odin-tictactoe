const gameItems = {
  X: 'static/x.svg',
  O: 'static/o.svg',
}
const checkWinningCombos = value => [
  [[value, '-', '-'], ['-', value, '-'], ['-', '-', value]],
  [['-', '-', value], ['-', value, '-'], [value, '-', '-']],
  [[value, '-', '-'], [value, '-', '-'], [value, '-', '-']],
  [['-', value, '-'], ['-', value, '-'], ['-', value, '-']],
  [['-', '-', value], ['-', '-', value], ['-', '-', value]],
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
  let gameField = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']];
  const getGameField = () => gameField;
  let turnSwitcher = true;
  const getTurnSwitcher = () => turnSwitcher;
  const changeTurnSwitcher = (value) => turnSwitcher = value;

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
    gameField = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']];
    changeTurnSwitcher(true);
    changeAnnouncement('Play the game!');
  }

  const turn = field => {
    if (field.hasChildNodes()) {
      changeAnnouncement('This field is already taken!');
    } else {
      const img = document.createElement('img');
      let classField = field.getAttribute('class').split(' ')[1];
      classField = classField.split('-');

      if (getTurnSwitcher()) {
        gameField[classField[0]][classField[1]] = 'X';
        img.src = gameItems['X'];
      } else {
        gameField[classField[0]][classField[1]] = 'O';
        img.src = gameItems['O'];
      }

      img.setAttribute('class', 'item');
      field.appendChild(img);

      if (check(gameField[classField[0]][classField[1]])) {
        switch (getTurnSwitcher()) {
          case true:
            player1.win();
            getPlayerScore()[0].textContent = player1.getScore();
            changeAnnouncement(`${player1.getName()} wins!`)
            break;
          case false:
            player2.win();
            getPlayerScore()[0].textContent = player2.getScore();
            changeAnnouncement(`${player2.getName()} wins!`)
            break;
        }
        stop();
      } else {
        changeAnnouncement('Next turn');
        getTurnSwitcher() == true ? changeTurnSwitcher(false) : changeTurnSwitcher(true);
      }
    }
  }

  const check = (value) => {
    let status = false;
    getGameField().some(((field) => {
      if (field.every((item) => item === value)) status = true;
    }));
    if (status === false) {
      let revisedGameField = JSON.parse(JSON.stringify(getGameField())); // Creating deep copy
      revisedGameField.forEach((combo) => {
        combo.forEach((item, index) => item != value ? combo[index] = '-' : item)
      })
      status = checkWinningCombos(value).some((element) =>
        JSON.stringify(element) == JSON.stringify(revisedGameField)
      );
    }
    return status;
  }

  const stop = () => {
    getFields().forEach((field) => {
      let newField = field.cloneNode(true);
      field.parentNode.replaceChild(newField, field);
    });
  }

  return { reset, turn, getGameField };
})();


document.querySelector('button.restart').addEventListener('click', gameBoard.reset)
document.querySelectorAll('div.field').forEach((field) =>
  field.addEventListener('click', () => gameBoard.turn(field))
);

const playerNames = document.querySelectorAll('div.player-score>h3');
playerNames[0].textContent = player1.getName();
playerNames[1].textContent = player2.getName();