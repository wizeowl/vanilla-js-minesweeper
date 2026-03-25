const ACTIONS = {
  NEW_GAME: 'NEW_GAME',
  REVEAL: 'REVEAL',
  REVEAL_AROUND: 'REVEAL_AROUND',
  FLAG: 'FLAG',
};

function openInstructionsDialog() {
  const instructionsDialog = document.querySelector(UI_ELEMENTS.INSTRUCTIONS_DIALOG);
  instructionsDialog.showModal();
  document.querySelector(UI_ELEMENTS.CLOSE_INSTRUCTIONS_BUTTON)?.focus();
  document.querySelector(UI_ELEMENTS.REVEAL_INSTRUCTION).textContent = getShortcut(ACTIONS.REVEAL);
  document.querySelector(UI_ELEMENTS.FLAG_INSTRUCTION).textContent = getShortcut(ACTIONS.FLAG);
  document.querySelector(UI_ELEMENTS.REVEAL_AROUND_INSTRUCTION).textContent = getShortcut(ACTIONS.REVEAL_AROUND);
  if (typeof announceStatus === 'function') {
    announceStatus('Instructions dialog opened.');
  }
}

function closeInstructionsDialog() {
  document.querySelector(UI_ELEMENTS.INSTRUCTIONS_DIALOG).close();
  document.querySelector(UI_ELEMENTS.INSTRUCTIONS_BUTTON)?.focus();
  if (typeof announceStatus === 'function') {
    announceStatus('Instructions dialog closed.');
  }
}

function editShortcut(element, action) {
  const shortcutDialog = document.querySelector(UI_ELEMENTS.SHORTCUT_DIALOG);
  if (shortcutDialog.open) {
    return;
  }

  const cleanup = () => {
    shortcutDialog.removeEventListener('keydown', handleNewShortcut);
    shortcutDialog.removeEventListener('close', cleanup);
    shortcutDialog.removeEventListener('cancel', cleanup);
  };

  shortcutDialog.addEventListener('keydown', handleNewShortcut, { once: true });
  shortcutDialog.addEventListener('close', cleanup, { once: true });
  shortcutDialog.addEventListener('cancel', cleanup, { once: true });
  shortcutDialog.showModal();
  shortcutDialog.focus();
  if (typeof announceStatus === 'function') {
    announceStatus('Shortcut editor opened. Press a key.');
  }

  function handleNewShortcut(event) {
    const newShortCut = event.key;
    element.textContent = newShortCut;

    saveShortcut(action, newShortCut);
    if (typeof announceStatus === 'function') {
      announceStatus(`${action} shortcut set to ${newShortCut}.`);
    }
    shortcutDialog.close();
  }
}

function saveShortcut(action, shortcut) {
  localStorage.setItem(action, shortcut);
}

function getShortcut(action) {
  return localStorage.getItem(action) ?? getDefaultShortcut(action);
}

function getDefaultShortcut(action) {
  switch (action) {
    case ACTIONS.REVEAL:
      return 'f';
    case ACTIONS.REVEAL_AROUND:
      return 'x';
    case ACTIONS.FLAG:
      return 'w';
    default:
      return;
  }
}
