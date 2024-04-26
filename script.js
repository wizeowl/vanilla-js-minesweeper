const UI_ELEMENTS = {
  MINES: {
    HUNDREDS: '.mines-hundreds',
    TENS: '.mines-tens',
    DIGITS: '.mines-digits',
  },
  TIMER: {
    HUNDREDS: '.timer-hundreds',
    TENS: '.timer-tens',
    DIGITS: '.timer-digits',
  },
  MAIN_BUTTON: '.main-button',
  GRID: '.grid',
  GRID_CONTAINER: '.grid-container',
  HIGHLIGHT_ELEMENT: '.grid-item-highlight',
};

const CSS_CLASSES = {
  GAME_OVER: 'game-over',
  GAME_WON: 'game-won',
  HIGHLIGHT: 'grid-item-highlight',
  MINE: 'grid-mine',
  ITEM: 'grid-item',
  ERROR: 'grid-error',
  FLAG: 'grid-flag',
  QUESTION_MARK: 'grid-question-mark',
  ACTIVE: 'active',
};

const SYMBOLS = {
  MINE: '*',
  CURRENT: 'CURRENT',
  WON: 'WON',
  GAME_OVER: 'GAME_OVER',
  EXPERT: 'EXPERT',
  INTERMEDIATE: 'INTERMEDIATE',
  BEGINNER: 'BEGINNER',
  DIFFICULTY: 'DIFFICULTY',
  CONFIG: 'CONFIG',
  STATISTICS: 'STATISTICS',
};

const BEGINNER_GRID_CONFIG = {
  ROWS: 9,
  COLS: 9,
  MINES: 10,
  DIFFICULTY: SYMBOLS.BEGINNER,
};

const INTERMEDIATE_GRID_CONFIG = {
  ROWS: 16,
  COLS: 16,
  MINES: 40,
  DIFFICULTY: SYMBOLS.INTERMEDIATE,
};

const EXPERT_GRID_CONFIG = {
  ROWS: 16,
  COLS: 30,
  MINES: 99,
  DIFFICULTY: SYMBOLS.EXPERT,
};

const CELL_SIZE = 23;

let showQuestionMark = false;
let debugMode = false;
let gridConfig;
let rows;
let cols;
let mines;

let visited = new Set();
let flagged = new Set();
let status = SYMBOLS.CURRENT;
let time = 0;
let timerTicking = false;
let timerInterval;
let mainGrid;

let highlightElement;
let highlightX = 0;
let highlightY = 0;
let mainButton;
let minesHundreds;
let minesTens;
let minesDigits;
let timerHundreds;
let timerTens;
let timerDigits;

let lastClickTime = 0;

function paintGrid(grid) {
  const container = document.querySelector(UI_ELEMENTS.GRID);
  container.innerHTML = '';

  grid.forEach((row, i) => {
    row.forEach((element, j) => {
      const gridItem = document.createElement('div');
      gridItem.classList.add(CSS_CLASSES.ITEM);
      gridItem.dataset.row = i;
      gridItem.dataset.col = j;

      gridItem.addEventListener('click', () => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;
        if (timeDiff < 300) {
          // Handle double-click action here
          inspectNeighborhood(grid, i, j);

          // Reset lastClickTime
          lastClickTime = 0;
        } else {
          // single-click action
          inspect(grid, i, j);

          // Update lastClickTime
          lastClickTime = currentTime;
        }
      });

      gridItem.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        annotate(grid, i, j);
      });

      if (debugMode && grid[i][j]) gridItem.innerHTML = SYMBOLS.MINE;

      container.appendChild(gridItem);
    });
  });
}

function showMines(grid) {
  grid.forEach((row, i) => {
    row.forEach((element, j) => {
      if (grid[i][j] === SYMBOLS.MINE) {
        const gridItem = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
        gridItem.classList.add(CSS_CLASSES.MINE);
      }
    });
  });
}

function showError(row, col) {
  const gridItem = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  gridItem.classList.remove(CSS_CLASSES.MINE);
  gridItem.classList.add(CSS_CLASSES.ERROR);
  mainButton.classList.add(CSS_CLASSES.GAME_OVER);
  registerLoss(gridConfig.DIFFICULTY);
  stopTimer();
}

function annotate(grid, row, col) {
  const key = `${row}, ${col}`;
  if (visited.has(key)) {
    return;
  }

  const gridItem = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const hasFlag = gridItem.classList.contains(CSS_CLASSES.FLAG);
  const hasQuestionMark = gridItem.classList.contains(CSS_CLASSES.QUESTION_MARK);

  if (hasFlag) {
    gridItem.classList.remove(CSS_CLASSES.FLAG);
    flagged.delete(key);
  } else if (hasQuestionMark) {
    gridItem.classList.remove(CSS_CLASSES.QUESTION_MARK);
    gridItem.classList.add(CSS_CLASSES.FLAG);
  } else {
    gridItem.classList.add(showQuestionMark ? CSS_CLASSES.QUESTION_MARK : CSS_CLASSES.FLAG);
  }

  if (gridItem.classList.contains(CSS_CLASSES.FLAG)) {
    flagged.add(key);
  }

  updateMinesCounter();
}

function inspectNeighborhood(grid, row, col) {
  const neighboringSquares = getNeighboringSquares(grid, row, col);
  const neighboringMines = neighboringSquares.filter(([s]) => s === SYMBOLS.MINE);
  const neighboringNonMines = neighboringSquares.filter(([s]) => s !== SYMBOLS.MINE);
  const allNeighboringMinesAreFlagged = neighboringMines.every(([_, i, j]) => flagged.has(`${i}, ${j}`));
  if (allNeighboringMinesAreFlagged) {
    neighboringNonMines.forEach(([_, i, j]) => inspect(grid, i, j));
  }
  inspect(grid, row, col);
}

function inspect(grid, row, col) {
  if (!timerTicking) {
    startTimer();
  }

  const key = `${row}, ${col}`;

  if (flagged.has(key) || visited.has(key) || status === SYMBOLS.GAME_OVER || status === SYMBOLS.WON) {
    return;
  }

  if (grid[row][col] === SYMBOLS.MINE) {
    status = SYMBOLS.GAME_OVER;
    showMines(grid);
    showError(row, col);
    return;
  }


  if (visited.has(key)) {
    return;
  }

  visited.add(key);
  const square = getNeighboringSquares(grid, row, col);
  const minesAround = square.filter(([cell]) => cell === SYMBOLS.MINE).length;
  const gridItem = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  gridItem.classList.add('grid' + minesAround);

  if (minesAround === 0) {
    square.forEach(([_, i, j]) => inspect(grid, i, j));
  }

  checkWin();
}

function checkWin() {
  const target = cols * rows - mines;
  if (target === visited.size) {
    registerWin(gridConfig.DIFFICULTY, time);
    calulateResults();
    status = SYMBOLS.WON;
    mainButton.classList.add(CSS_CLASSES.GAME_WON);
    stopTimer();
  }
}

function calulateResults() {
  const date = new Date();
  const statistics = getDifficultyStatistics(gridConfig.DIFFICULTY);
  const percentage = statistics.gamesPlayed ? Math.round((statistics.gamesWon * 100) / statistics.gamesPlayed) : 0;
  document.querySelector('.result-item:nth-child(1)').innerHTML = `Time: ${time} seconds`;
  document.querySelector('.result-item:nth-child(2)').innerHTML = `Date: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  document.querySelector('.result-item:nth-child(3)').innerHTML = `Best time: ${statistics.bestTime}`;
  document.querySelector('.result-item:nth-child(4)').innerHTML = `Games played: ${statistics.gamesPlayed}`;
  document.querySelector('.result-item:nth-child(5)').innerHTML = `Games won: ${statistics.gamesWon}`;
  document.querySelector('.result-item:nth-child(6)').innerHTML = `Games percentage: ${percentage}%`;
  document.querySelector('.best-result').innerHTML = time === statistics.bestTime
    ? 'You have the fastest time for this difficulty level'
    : '';
}

function initializeGridStyle(height, width) {
  const gridElement = document.querySelector(UI_ELEMENTS.GRID);
  const gridContainer = document.querySelector(UI_ELEMENTS.GRID_CONTAINER);

  gridElement.style.gridTemplateColumns = `repeat(${width}, ${CELL_SIZE}px)`;
  gridElement.style.gridTemplateRows = `repeat(${height}, ${CELL_SIZE}px)`;
  gridElement.style.height = `calc(${height} * ${CELL_SIZE}px)`;
  gridElement.style.width = `calc(${width} * ${CELL_SIZE}px)`;
  gridContainer.style.height = `calc(${height} * ${CELL_SIZE}px)`;
}

function getDefaultDifficultyConfig() {
  try {
    const difficultyConfig = JSON.parse(localStorage.getItem(SYMBOLS.CONFIG));
    if (difficultyConfig.COLS && difficultyConfig.ROWS && difficultyConfig.MINES) {
      return difficultyConfig;
    }
    return EXPERT_GRID_CONFIG;
  } catch (e) {
    return EXPERT_GRID_CONFIG;
  }
}

function setDifficulty(config) {
  updateGridConfig(config);
  mainGrid = init(gridConfig.ROWS, gridConfig.COLS, gridConfig.MINES);
  localStorage.setItem(SYMBOLS.CONFIG, JSON.stringify(config));
}

function updateGridConfig(config) {
  const buttons = document.querySelectorAll('.difficulty-controls button');
  buttons.forEach(button => button.classList.remove(CSS_CLASSES.ACTIVE));

  const difficultyButton = document.querySelector(`[data-difficulty="${config.DIFFICULTY}"]`);
  difficultyButton.classList.add(CSS_CLASSES.ACTIVE);

  gridConfig = config;
  rows = config.rows;
  cols = config.cols;
  mines = config.mines;
}

function init(numRows, numCols, numMines) {
  rows = numRows;
  cols = numCols;
  mines = numMines;
  const grid = generateGrid(rows, cols, mines);

  stopTimer();
  time = 0;
  updateTimer();

  visited = new Set();
  flagged = new Set();
  status = SYMBOLS.CURRENT;
  updateMinesCounter();

  initHighlight();

  mainButton.classList.remove(CSS_CLASSES.GAME_OVER);
  mainButton.classList.remove(CSS_CLASSES.GAME_WON);

  initializeGridStyle(rows, cols);
  paintGrid(grid);

  return grid;
}

document.addEventListener('DOMContentLoaded', function() {
  mainButton = document.querySelector(UI_ELEMENTS.MAIN_BUTTON);
  minesHundreds = document.querySelector(UI_ELEMENTS.MINES.HUNDREDS);
  minesTens = document.querySelector(UI_ELEMENTS.MINES.TENS);
  minesDigits = document.querySelector(UI_ELEMENTS.MINES.DIGITS);
  timerHundreds = document.querySelector(UI_ELEMENTS.TIMER.HUNDREDS);
  timerTens = document.querySelector(UI_ELEMENTS.TIMER.TENS);
  timerDigits = document.querySelector(UI_ELEMENTS.TIMER.DIGITS);
  highlightElement = document.querySelector(UI_ELEMENTS.HIGHLIGHT_ELEMENT);

  updateGridConfig(getDefaultDifficultyConfig());
  mainGrid = init(gridConfig.ROWS, gridConfig.COLS, gridConfig.MINES);

  document.addEventListener('keydown', function(event) {
    // the new game shortcut should function regardless of the game status
    if (event.key === 'Enter') {
      mainGrid = init(gridConfig.ROWS, gridConfig.COLS, gridConfig.MINES);
    }

    if (status === SYMBOLS.WON || status === SYMBOLS.GAME_OVER) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        moveHighlight(-1, 0, gridConfig.ROWS - 1, gridConfig.COLS - 1);
        break;
      case 'ArrowUp':
        moveHighlight(0, -1, gridConfig.ROWS - 1, gridConfig.COLS - 1);
        break;
      case 'ArrowRight':
        moveHighlight(1, 0, gridConfig.ROWS - 1, gridConfig.COLS - 1);
        break;
      case 'ArrowDown':
        moveHighlight(0, 1, gridConfig.ROWS - 1, gridConfig.COLS - 1);
        break;
      case 'w':
        annotate(mainGrid, highlightY, highlightX);
        break;
      case 'x':
        inspectNeighborhood(mainGrid, highlightY, highlightX);
        break;
      case 'c':
        inspect(mainGrid, highlightY, highlightX);
        break;
      default:
        console.log(event.key);
      // Ignore other keys
    }
  });
});
