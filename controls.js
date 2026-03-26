const ACTIONS = {
  NEW_GAME: 'NEW_GAME',
  REVEAL: 'REVEAL',
  REVEAL_AROUND: 'REVEAL_AROUND',
  FLAG: 'FLAG',
};

let keyboardControlsDialogReturnFocusElement = null;
let touchControlsDialogReturnFocusElement = null;
let shortcutDialogReturnFocusElement = null;

function getActionLabel(action) {
  switch (action) {
    case ACTIONS.REVEAL:
      return 'Reveal selected cell';
    case ACTIONS.FLAG:
      return 'Flag or unflag a mine';
    case ACTIONS.REVEAL_AROUND:
      return 'Reveal surrounding cells';
    default:
      return action;
  }
}

function formatShortcutLabel(shortcut) {
  if (!shortcut) {
    return '—';
  }

  if (shortcut === ' ') {
    return 'Space';
  }

  if (shortcut.startsWith('Arrow')) {
    return shortcut.replace('Arrow', 'Arrow ');
  }

  return shortcut.length === 1 ? shortcut.toUpperCase() : shortcut;
}

function normalizeShortcutKey(key) {
  return key.length === 1 ? key.toLowerCase() : key;
}

function isReservedShortcutKey(key) {
  return [
    'Escape',
    'Enter',
    'Tab',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Shift',
    'Control',
    'Alt',
    'Meta',
  ].includes(key);
}

function syncShortcutDisplays() {
  document.querySelectorAll(UI_ELEMENTS.SHORTCUT_VALUE).forEach((element) => {
    const action = element.dataset.shortcutValue;
    if (!action || !ACTIONS[action]) {
      return;
    }

    const shortcut = getShortcut(ACTIONS[action]);
    const label = formatShortcutLabel(shortcut);
    element.textContent = label;
    element.setAttribute('aria-label', `Current shortcut: ${label}`);
  });
}

function openKeyboardControlsDialog() {
  const keyboardControlsDialog = document.querySelector(UI_ELEMENTS.KEYBOARD_CONTROLS_DIALOG);
  if (!keyboardControlsDialog || keyboardControlsDialog.open) {
    return;
  }

  keyboardControlsDialogReturnFocusElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : document.querySelector(UI_ELEMENTS.KEYBOARD_CONTROLS_BUTTON);

  syncShortcutDisplays();
  keyboardControlsDialog.showModal();
  document.querySelector(UI_ELEMENTS.CLOSE_KEYBOARD_CONTROLS_BUTTON)?.focus();
  if (typeof announceStatus === 'function') {
    announceStatus('Keyboard controls dialog opened.');
  }
}

function closeKeyboardControlsDialog() {
  const keyboardControlsDialog = document.querySelector(UI_ELEMENTS.KEYBOARD_CONTROLS_DIALOG);
  if (!keyboardControlsDialog?.open) {
    return;
  }

  keyboardControlsDialog.close();
  (keyboardControlsDialogReturnFocusElement ?? document.querySelector(UI_ELEMENTS.KEYBOARD_CONTROLS_BUTTON))?.focus?.();
  keyboardControlsDialogReturnFocusElement = null;
  if (typeof announceStatus === 'function') {
    announceStatus('Keyboard controls dialog closed.');
  }
}

function openTouchControlsDialog() {
  const touchControlsDialog = document.querySelector(UI_ELEMENTS.TOUCH_CONTROLS_DIALOG);
  if (!touchControlsDialog || touchControlsDialog.open) {
    return;
  }

  touchControlsDialogReturnFocusElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : document.querySelector(UI_ELEMENTS.TOUCH_CONTROLS_BUTTON);

  touchControlsDialog.showModal();
  document.querySelector(UI_ELEMENTS.CLOSE_TOUCH_CONTROLS_BUTTON)?.focus();
  if (typeof announceStatus === 'function') {
    announceStatus('Touch controls dialog opened.');
  }
}

function closeTouchControlsDialog() {
  const touchControlsDialog = document.querySelector(UI_ELEMENTS.TOUCH_CONTROLS_DIALOG);
  if (!touchControlsDialog?.open) {
    return;
  }

  touchControlsDialog.close();
  (touchControlsDialogReturnFocusElement ?? document.querySelector(UI_ELEMENTS.TOUCH_CONTROLS_BUTTON))?.focus?.();
  touchControlsDialogReturnFocusElement = null;
  if (typeof announceStatus === 'function') {
    announceStatus('Touch controls dialog closed.');
  }
}

function editShortcut(triggerElement, displayElement, action) {
  const shortcutDialog = document.querySelector(UI_ELEMENTS.SHORTCUT_DIALOG);
  if (!shortcutDialog || shortcutDialog.open) {
    return;
  }

  shortcutDialogReturnFocusElement = triggerElement;
  const actionLabel = getActionLabel(action);
  const shortcutDialogDescription = shortcutDialog.querySelector('#shortcut-dialog-description');
  if (shortcutDialogDescription) {
    shortcutDialogDescription.textContent = `Press a key for ${actionLabel}. Press Escape to cancel.`;
  }

  const cleanup = () => {
    shortcutDialog.removeEventListener('keydown', handleNewShortcut);
    shortcutDialog.removeEventListener('close', cleanup);
    shortcutDialog.removeEventListener('cancel', handleCancel);
  };

  const handleCancel = (event) => {
    event.preventDefault();
    shortcutDialog.close('cancel');
    shortcutDialogReturnFocusElement?.focus?.();
    shortcutDialogReturnFocusElement = null;
    if (typeof announceStatus === 'function') {
      announceStatus('Shortcut editor closed.');
    }
  };

  shortcutDialog.addEventListener('keydown', handleNewShortcut);
  shortcutDialog.addEventListener('close', cleanup, { once: true });
  shortcutDialog.addEventListener('cancel', handleCancel);
  shortcutDialog.showModal();
  shortcutDialog.focus();
  if (typeof announceStatus === 'function') {
    announceStatus('Shortcut editor opened. Press a key.');
  }

  function handleNewShortcut(event) {
    if (event.key === 'Escape') {
      return;
    }

    if (isReservedShortcutKey(event.key)) {
      if (typeof announceStatus === 'function') {
        announceStatus(`${formatShortcutLabel(event.key)} is reserved and cannot be assigned.`);
      }
      return;
    }

    event.preventDefault();

    const newShortcut = normalizeShortcutKey(event.key);
    const shortcutLabel = formatShortcutLabel(newShortcut);
    displayElement.textContent = shortcutLabel;
    displayElement.setAttribute('aria-label', `Current shortcut: ${shortcutLabel}`);

    saveShortcut(action, newShortcut);
    if (typeof announceStatus === 'function') {
      announceStatus(`${actionLabel} shortcut set to ${shortcutLabel}.`);
    }
    shortcutDialog.close('saved');
    shortcutDialogReturnFocusElement?.focus?.();
    shortcutDialogReturnFocusElement = null;
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
