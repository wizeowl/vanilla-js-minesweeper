function updateCounter(number, hundredsElem, tensElem, digitsElem) {
  const [h, t, d] = getDigits(number);
  hundredsElem.classList.remove('d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9');
  hundredsElem.classList.add('d' + h);

  tensElem.classList.remove('d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9');
  tensElem.classList.add('d' + t);

  digitsElem.classList.remove('d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9');
  digitsElem.classList.add('d' + d);
}

function startTimer() {
  timerTicking = true;
  timerInterval = setInterval(function() {
    time++;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  timerTicking = false;
  clearInterval(timerInterval);
}

function updateTimer() {
  updateCounter(time, timerHundreds, timerTens, timerDigits);
  if (typeof announceStatus === 'function' && time > 0 && time % 30 === 0) {
    announceStatus(`Timer: ${time} seconds`);
  }
}

function updateMinesCounter() {
  const remainingMines = mines - flagged.size;
  updateCounter(remainingMines, minesHundreds, minesTens, minesDigits);
  if (typeof announceStatus === 'function') {
    announceStatus(`Mines remaining: ${remainingMines}.`);
  }
}
