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
  NEW_GAME_BUTTON: '.new-game-button',
  GRID: '.grid',
  GAME_CONTAINER: '.game-container',
  GRID_CONTAINER: '.grid-container',
  HIGHLIGHT_ELEMENT: '.grid-item-highlight',
  DIFFICULTY_BUTTON: '.difficulty-controls button',
  INSTRUCTIONS_DIALOG: 'dialog.instruction-dialog',
  CLOSE_INSTRUCTIONS_BUTTON: '.close-instructions-button',
  SHORTCUT_DIALOG: 'dialog.shortcut-dialog',
  REVEAL_INSTRUCTION: '.instruction.REVEAL',
  FLAG_INSTRUCTION: '.instruction.FLAG',
  REVEAL_AROUND_INSTRUCTION: '.instruction.REVEAL_AROUND',
  INSTRUCTIONS_BUTTON: '.instructions-button',
  SHORTCUT_INSTRUCTION: '.instruction[data-action]',
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
const DOUBLE_TAP_THRESHOLD_MS = 300;
const LONG_PRESS_THRESHOLD_MS = 450;
const GHOST_CLICK_THRESHOLD_MS = 700;
const HAPTIC_THROTTLE_MS = 40;

const HAPTIC_PATTERNS = {
  REVEAL: 12,
  FLAG: [18],
  WIN: [30, 40, 55],
  GAME_OVER: [65, 40, 65],
};

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
let lastTouchInteractionTime = 0;
let lastTap = null;
let lastHapticTimestamp = 0;
let gridItems = [];

function triggerHaptic(pattern) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }

  const now = Date.now();
  if (now - lastHapticTimestamp < HAPTIC_THROTTLE_MS) {
    return;
  }

  navigator.vibrate(pattern);
  lastHapticTimestamp = now;
}

function getGridItem(row, col) {
  return gridItems[row]?.[col] ?? null;
}

function paintGrid(grid) {
  const container = document.querySelector(UI_ELEMENTS.GRID);
  container.innerHTML = '';
  gridItems = Array.from({ length: grid.length }, () => Array(grid[0].length));
  const fragment = document.createDocumentFragment();

  grid.forEach((row, i) => {
    row.forEach((element, j) => {
      const gridItem = document.createElement('div');
      gridItem.classList.add(CSS_CLASSES.ITEM);
      gridItem.dataset.row = i;
      gridItem.dataset.col = j;

      gridItem.addEventListener('click', () => {
        if (Date.now() - lastTouchInteractionTime < GHOST_CLICK_THRESHOLD_MS) {
          return;
        }

        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;
        if (timeDiff < DOUBLE_TAP_THRESHOLD_MS) {
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

      let longPressTimeout;
      let longPressTriggered = false;

      gridItem.addEventListener('touchstart', (event) => {
        event.preventDefault();
        longPressTriggered = false;

        longPressTimeout = setTimeout(() => {
          annotate(grid, i, j);
          longPressTriggered = true;
          lastTap = null;
          lastTouchInteractionTime = Date.now();
        }, LONG_PRESS_THRESHOLD_MS);
      }, { passive: false });

      gridItem.addEventListener('touchend', (event) => {
        event.preventDefault();
        clearTimeout(longPressTimeout);

        if (longPressTriggered) {
          return;
        }

        const now = Date.now();
        const isDoubleTap = lastTap
          && lastTap.row === i
          && lastTap.col === j
          && now - lastTap.time < DOUBLE_TAP_THRESHOLD_MS;

        if (isDoubleTap) {
          inspectNeighborhood(grid, i, j);
          lastTap = null;
        } else {
          inspect(grid, i, j);
          lastTap = { row: i, col: j, time: now };
        }

        lastTouchInteractionTime = now;
      }, { passive: false });

      gridItem.addEventListener('touchmove', () => {
        clearTimeout(longPressTimeout);
      }, { passive: true });

      gridItem.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimeout);
      });

      if (debugMode && grid[i][j]) gridItem.textContent = SYMBOLS.MINE;

      gridItems[i][j] = gridItem;
      fragment.appendChild(gridItem);
    });
  });

  container.appendChild(fragment);
}

function showMines(grid) {
  grid.forEach((row, i) => {
    row.forEach((element, j) => {
      if (grid[i][j] === SYMBOLS.MINE) {
        const gridItem = getGridItem(i, j);
        gridItem.classList.add(CSS_CLASSES.MINE);
      }
    });
  });
}

function showError(row, col) {
  const gridItem = getGridItem(row, col);
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

  const gridItem = getGridItem(row, col);
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
  triggerHaptic(HAPTIC_PATTERNS.FLAG);
}

function inspectNeighborhood(grid, row, col) {
  const key = `${row}, ${col}`;
  if (!visited.has(key) || status === SYMBOLS.GAME_OVER || status === SYMBOLS.WON) {
    return;
  }

  const neighboringSquares = getNeighboringSquares(grid, row, col);
  const minesAround = neighboringSquares.filter(([cell]) => cell === SYMBOLS.MINE).length;
  const neighboringFlags = neighboringSquares.filter(([_, i, j]) => flagged.has(`${i}, ${j}`)).length;

  if (neighboringFlags === minesAround) {
    triggerHaptic(HAPTIC_PATTERNS.REVEAL);
    neighboringSquares.forEach(([_, i, j]) => {
      if (!flagged.has(`${i}, ${j}`)) {
        inspect(grid, i, j, { triggerRevealHaptic: false });
      }
    });
  }
}

function inspect(grid, row, col, options = {}) {
  const { triggerRevealHaptic = true } = options;

  if (!timerTicking) {
    startTimer();
  }

  const key = `${row}, ${col}`;

  if (flagged.has(key) || visited.has(key) || status === SYMBOLS.GAME_OVER || status === SYMBOLS.WON) {
    return;
  }

  if (grid[row][col] === SYMBOLS.MINE) {
    status = SYMBOLS.GAME_OVER;
    triggerHaptic(HAPTIC_PATTERNS.GAME_OVER);
    showMines(grid);
    showError(row, col);
    return;
  }


  if (visited.has(key)) {
    return;
  }

  visited.add(key);
  if (triggerRevealHaptic) {
    triggerHaptic(HAPTIC_PATTERNS.REVEAL);
  }

  const square = getNeighboringSquares(grid, row, col);
  const minesAround = square.filter(([cell]) => cell === SYMBOLS.MINE).length;
  const gridItem = getGridItem(row, col);
  gridItem.classList.add('grid' + minesAround);

  if (minesAround === 0) {
    square.forEach(([_, i, j]) => inspect(grid, i, j, { triggerRevealHaptic: false }));
  }

  checkWin();
}

function checkWin() {
  const target = cols * rows - mines;
  if (target === visited.size) {
    triggerHaptic(HAPTIC_PATTERNS.WIN);
    registerWin(gridConfig.DIFFICULTY, time);
    calculateResults();
    status = SYMBOLS.WON;
    mainButton.classList.add(CSS_CLASSES.GAME_WON);
    stopTimer();
  }
}

function calculateResults() {
  const date = new Date();
  const statistics = getDifficultyStatistics(gridConfig.DIFFICULTY);
  const percentage = statistics.gamesPlayed ? Math.round((statistics.gamesWon * 100) / statistics.gamesPlayed) : 0;
  document.querySelector('.result-item:nth-child(1)').textContent = `Time: ${time} seconds`;
  document.querySelector('.result-item:nth-child(2)').textContent = `Date: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  document.querySelector('.result-item:nth-child(3)').textContent = `Best time: ${statistics.bestTime}`;
  document.querySelector('.result-item:nth-child(4)').textContent = `Games played: ${statistics.gamesPlayed}`;
  document.querySelector('.result-item:nth-child(5)').textContent = `Games won: ${statistics.gamesWon}`;
  document.querySelector('.result-item:nth-child(6)').textContent = `Games percentage: ${percentage}%`;
  document.querySelector('.best-result').textContent = time === statistics.bestTime
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
  document.querySelector(UI_ELEMENTS.GRID_CONTAINER).focus();
}

function startNewGame() {
  mainGrid = init(gridConfig.ROWS, gridConfig.COLS, gridConfig.MINES);
}

function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case SYMBOLS.BEGINNER:
      return BEGINNER_GRID_CONFIG;
    case SYMBOLS.INTERMEDIATE:
      return INTERMEDIATE_GRID_CONFIG;
    case SYMBOLS.EXPERT:
      return EXPERT_GRID_CONFIG;
    default:
      return null;
  }
}

function bindKeyboardActivation(element, callback) {
  if (!element) {
    return;
  }

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  });
}

function isDialogOpen() {
  return Boolean(document.querySelector('dialog[open]'));
}

function bindStaticEventListeners() {
  mainButton.addEventListener('click', startNewGame);
  bindKeyboardActivation(mainButton, startNewGame);

  const newGameButton = document.querySelector(UI_ELEMENTS.NEW_GAME_BUTTON);
  if (newGameButton) {
    newGameButton.addEventListener('click', startNewGame);
  }

  highlightElement.addEventListener('click', () => inspect(mainGrid, highlightY, highlightX));
  highlightElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    annotate(mainGrid, highlightY, highlightX);
  });
  bindKeyboardActivation(highlightElement, () => inspect(mainGrid, highlightY, highlightX));

  const instructionsButton = document.querySelector(UI_ELEMENTS.INSTRUCTIONS_BUTTON);
  if (instructionsButton) {
    instructionsButton.addEventListener('click', openInstructionsDialog);
    bindKeyboardActivation(instructionsButton, openInstructionsDialog);
  }

  document.querySelectorAll(UI_ELEMENTS.DIFFICULTY_BUTTON).forEach((button) => {
    button.addEventListener('click', () => {
      const config = getDifficultyConfig(button.dataset.difficulty);
      if (config) {
        setDifficulty(config);
      }
    });
  });

  document.querySelectorAll(UI_ELEMENTS.SHORTCUT_INSTRUCTION).forEach((element) => {
    const openShortcutEditor = () => {
      const action = element.dataset.action;
      if (action && ACTIONS[action]) {
        editShortcut(element, ACTIONS[action]);
      }
    };

    element.addEventListener('click', openShortcutEditor);
    bindKeyboardActivation(element, openShortcutEditor);
  });
}

function updateGridConfig(config) {
  const buttons = document.querySelectorAll(UI_ELEMENTS.DIFFICULTY_BUTTON);
  buttons.forEach(button => button.classList.remove(CSS_CLASSES.ACTIVE));

  const difficultyButton = document.querySelector(`[data-difficulty="${config.DIFFICULTY}"]`);
  difficultyButton.classList.add(CSS_CLASSES.ACTIVE);

  gridConfig = config;
  rows = config.ROWS ?? config.rows;
  cols = config.COLS ?? config.cols;
  mines = config.MINES ?? config.mines;
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
  lastTap = null;
  lastTouchInteractionTime = 0;
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
  const closeInstructionsButton = document.querySelector(UI_ELEMENTS.CLOSE_INSTRUCTIONS_BUTTON);

  if (closeInstructionsButton) {
    closeInstructionsButton.addEventListener('click', closeInstructionsDialog);
    bindKeyboardActivation(closeInstructionsButton, closeInstructionsDialog);
  }

  bindStaticEventListeners();

  updateGridConfig(getDefaultDifficultyConfig());
  mainGrid = init(gridConfig.ROWS, gridConfig.COLS, gridConfig.MINES);

  document.addEventListener('keydown', function(event) {
    if (event.defaultPrevented || isDialogOpen()) {
      return;
    }

    // the new game shortcut should function regardless of the game status
    if (event.key === 'Enter') {
      startNewGame();
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
      case getShortcut(ACTIONS.FLAG):
        annotate(mainGrid, highlightY, highlightX);
        break;
      case getShortcut(ACTIONS.REVEAL_AROUND):
        inspectNeighborhood(mainGrid, highlightY, highlightX);
        break;
      case getShortcut(ACTIONS.REVEAL):
        inspect(mainGrid, highlightY, highlightX);
        break;
      default:
        console.log(event.key);
      // Ignore other keys
    }
  });
});
