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
}

function updateMinesCounter() {
  updateCounter(mines - flagged.size, minesHundreds, minesTens, minesDigits);
}
