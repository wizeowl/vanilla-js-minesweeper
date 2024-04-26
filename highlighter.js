function renderHighlight(col = highlightX, row = highlightY) {
  highlightElement.style.left = (col * CELL_SIZE + 20) + 'px';
  highlightElement.style.top = (row * CELL_SIZE + 1) + 'px';
}

function initHighlight() {
  highlightX = 0;
  highlightY = 0;
  renderHighlight();
}

function moveHighlight(incrementX, incrementY, maxRow, maxCol) {
  highlightX = incrementX < 0 ? Math.max(highlightX + incrementX, 0) : Math.min(highlightX + incrementX, maxCol);
  highlightY = incrementY < 0 ? Math.max(highlightY + incrementY, 0) : Math.min(highlightY + incrementY, maxRow);
  renderHighlight();
}
