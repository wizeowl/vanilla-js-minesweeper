const ACTIONS = {
  NEW_GAME: 'NEW_GAME',
  REVEAL: 'REVEAL',
  REVEAL_AROUND: 'REVEAL_AROUND',
  FLAG: 'FLAG',
};

function openInstructionsDialog() {
  document.querySelector(UI_ELEMENTS.INSTRUCTIONS_DIALOG).showModal();
  document.querySelector(UI_ELEMENTS.REVEAL_INSTRUCTION).textContent = getShortcut(ACTIONS.REVEAL);
  document.querySelector(UI_ELEMENTS.FLAG_INSTRUCTION).textContent = getShortcut(ACTIONS.FLAG);
  document.querySelector(UI_ELEMENTS.REVEAL_AROUND_INSTRUCTION).textContent = getShortcut(ACTIONS.REVEAL_AROUND);
}

function closeInstructionsDialog() {
  document.querySelector(UI_ELEMENTS.INSTRUCTIONS_DIALOG).close();
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

  function handleNewShortcut(event) {
    const newShortCut = event.key;
    element.textContent = newShortCut;

    saveShortcut(action, newShortCut);
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
