function shuffleArray(array) {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createRandomArrayWithNMines(size, n, mineSymbol) {
  const arr = Array.from({ length: size }, (_, i) => i < n ? mineSymbol : undefined);
  shuffleArray(arr);
  return arr;
}

function partitionRandomly(size, n) {
  let arr = Array(size).fill(0);

  // Distribute 'n' into random sub-elements
  for (let i = 0; i < n; i++) {
    // Generate a random index between 0 and size-1
    const randomIndex = Math.floor(Math.random() * size);
    // Increment the value at the randomly selected index
    arr[randomIndex]++;
  }

  return arr;
}


function generateGrid(height, width, n) {
  const elementsByLine = partitionRandomly(height, n);
  return Array(height).fill().map((e, i) => createRandomArrayWithNMines(width, elementsByLine[i], SYMBOLS.MINE));
}

function getNeighboringSquares(grid, row, col) {
  const neighbors = [];

  const rowStart = Math.max(0, row - 1);
  const rowEnd = Math.min(grid.length - 1, row + 1);
  const colStart = Math.max(0, col - 1);
  const colEnd = Math.min(grid[0].length - 1, col + 1);

  for (let i = rowStart; i <= rowEnd; i++) {
    for (let j = colStart; j <= colEnd; j++) {
      if (i !== row || j !== col) neighbors.push([grid[i][j], i, j]);
    }
  }
  return neighbors;
}

function getDigits(number) {
  const h = Math.floor((number) / 100);
  const t = Math.floor((number % 100) / 10);
  const d = number % 10;
  return [h, t, d];
}
