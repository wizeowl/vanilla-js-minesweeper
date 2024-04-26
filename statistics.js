const EMPTY_STATISTICS = {
  [SYMBOLS.BEGINNER]: { gamesWon: 0, gamesPlayed: 0, bestTime: NaN },
  [SYMBOLS.INTERMEDIATE]: { gamesWon: 0, gamesPlayed: 0, bestTime: NaN },
  [SYMBOLS.EXPERT]: { gamesWon: 0, gamesPlayed: 0, bestTime: NaN },
};

function getDifficultyStatistics(difficulty) {
  const savedStatistics = getSavedStatistics();
  return savedStatistics[difficulty];
}

function getSavedStatistics() {
  try {
    const storedStatistics = localStorage.getItem(SYMBOLS.STATISTICS);
    return storedStatistics === null ? EMPTY_STATISTICS : JSON.parse(storedStatistics);
  } catch (e) {
    return EMPTY_STATISTICS;
  }
}

function registerWin(difficulty, winTime) {
  const savedStatistics = getSavedStatistics();
  savedStatistics[difficulty].gamesPlayed++;
  savedStatistics[difficulty].gamesWon++;
  if(isNaN(savedStatistics[difficulty].bestTime) || winTime < savedStatistics[difficulty].bestTime) {
    savedStatistics[difficulty].bestTime = winTime;
  }
  localStorage.setItem(SYMBOLS.STATISTICS, savedStatistics);
}

function registerLoss(difficulty) {
  const savedStatistics = getSavedStatistics();
  savedStatistics[difficulty].gamesPlayed++;
  localStorage.setItem(SYMBOLS.STATISTICS, savedStatistics);
}
