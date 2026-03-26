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
  const totalSquares = height * width;
  const mineCount = Math.min(Math.max(0, n), totalSquares);
  const randomSquares = createRandomArrayWithNMines(totalSquares, mineCount, SYMBOLS.MINE);

  return Array.from({ length: height }, (_, rowIndex) => {
    const rowStart = rowIndex * width;
    return randomSquares.slice(rowStart, rowStart + width);
  });
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

function getProtectedZoneCoordinates(grid, row, col) {
  const coordinates = [[row, col]];

  getNeighboringSquares(grid, row, col).forEach(([_, neighborRow, neighborCol]) => {
    coordinates.push([neighborRow, neighborCol]);
  });

  return coordinates;
}

function relocateMinesFromProtectedZone(grid, row, col, mineSymbol) {
  if (!grid?.length || !grid[0]?.length) {
    return false;
  }

  const protectedCoordinates = getProtectedZoneCoordinates(grid, row, col);
  const protectedSet = new Set(
    protectedCoordinates.map(([protectedRow, protectedCol]) => `${protectedRow},${protectedCol}`)
  );

  const minesToRelocate = protectedCoordinates.filter(
    ([protectedRow, protectedCol]) => grid[protectedRow][protectedCol] === mineSymbol
  );

  if (minesToRelocate.length === 0) {
    return true;
  }

  const relocationTargets = [];

  grid.forEach((gridRow, gridRowIndex) => {
    gridRow.forEach((cell, gridColIndex) => {
      const key = `${gridRowIndex},${gridColIndex}`;
      if (!protectedSet.has(key) && cell !== mineSymbol) {
        relocationTargets.push([gridRowIndex, gridColIndex]);
      }
    });
  });

  if (relocationTargets.length < minesToRelocate.length) {
    return false;
  }

  shuffleArray(relocationTargets);

  minesToRelocate.forEach(([mineRow, mineCol]) => {
    grid[mineRow][mineCol] = undefined;
  });

  relocationTargets.slice(0, minesToRelocate.length).forEach(([targetRow, targetCol]) => {
    grid[targetRow][targetCol] = mineSymbol;
  });

  return true;
}

function getDigits(number) {
  const h = Math.floor((number) / 100);
  const t = Math.floor((number % 100) / 10);
  const d = number % 10;
  return [h, t, d];
}
