/**
 * User Preferences Module
 * Manages accessibility preferences: haptics enabled/disabled, announcement verbosity levels
 * Persists to localStorage and provides getters/setters
 */

const PREFERENCES = {
  HAPTICS_ENABLED: 'a11y_haptics_enabled',
  ANNOUNCEMENT_LEVEL: 'a11y_announcement_level',
};

const ANNOUNCEMENT_LEVELS = {
  NORMAL: 'normal',
  VERBOSE: 'verbose',
};

const PREFERENCE_UI = {
  BUTTON: '#menu-preferences',
  DIALOG: '.preferences-dialog',
  CLOSE_BUTTON: '.close-preferences-button',
  HAPTICS_TOGGLE: '.preference-haptics-toggle',
  VERBOSE_TOGGLE: '.preference-verbose-toggle',
};

let preferencesDialogReturnFocusElement = null;

/**
 * Get user preference with fallback to default
 * @param {string} key - Preference key (from PREFERENCES)
 * @param {any} defaultValue - Default value if not set
 * @returns {any} Preference value
 */
function getPreference(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return defaultValue;
    }
    // Try to parse as JSON for boolean/complex values
    return JSON.parse(stored);
  } catch (e) {
    console.warn(`Failed to parse preference ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Set user preference
 * @param {string} key - Preference key (from PREFERENCES)
 * @param {any} value - Value to store
 */
function setPreference(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to set preference ${key}:`, e);
  }
}

/**
 * Check if haptics are enabled
 * Defaults to true if not explicitly disabled
 * @returns {boolean}
 */
function isHapticsEnabled() {
  return getPreference(PREFERENCES.HAPTICS_ENABLED, true);
}

/**
 * Enable or disable haptics
 * @param {boolean} enabled
 */
function setHapticsEnabled(enabled) {
  setPreference(PREFERENCES.HAPTICS_ENABLED, enabled);
}

/**
 * Get announcement verbosity level
 * Defaults to ANNOUNCEMENT_LEVELS.NORMAL
 * @returns {string}
 */
function getAnnouncementLevel() {
  return getPreference(PREFERENCES.ANNOUNCEMENT_LEVEL, ANNOUNCEMENT_LEVELS.NORMAL);
}

/**
 * Set announcement verbosity level
 * @param {string} level - One of ANNOUNCEMENT_LEVELS values
 */
function setAnnouncementLevel(level) {
  if (!Object.values(ANNOUNCEMENT_LEVELS).includes(level)) {
    console.warn(`Invalid announcement level: ${level}`);
    return;
  }
  setPreference(PREFERENCES.ANNOUNCEMENT_LEVEL, level);
}

/**
 * Check if message should be announced based on current verbosity level
 * @param {string} messageType - Type of message (e.g., 'brief', 'verbose')
 * @returns {boolean}
 */
function shouldAnnounce(messageType) {
  const level = getAnnouncementLevel();
  if (level === ANNOUNCEMENT_LEVELS.VERBOSE) {
    return true;
  }
  // NORMAL level: only announce critical messages
  return messageType !== 'verbose';
}

function syncPreferencesUi() {
  const hapticsToggle = document.querySelector(PREFERENCE_UI.HAPTICS_TOGGLE);
  const verboseToggle = document.querySelector(PREFERENCE_UI.VERBOSE_TOGGLE);

  if (hapticsToggle) {
    hapticsToggle.checked = isHapticsEnabled();
  }

  if (verboseToggle) {
    verboseToggle.checked = getAnnouncementLevel() === ANNOUNCEMENT_LEVELS.VERBOSE;
  }
}

function openPreferencesDialog() {
  const dialog = document.querySelector(PREFERENCE_UI.DIALOG);
  if (!dialog || dialog.open) {
    return;
  }

  preferencesDialogReturnFocusElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : document.querySelector(PREFERENCE_UI.BUTTON);

  syncPreferencesUi();
  dialog.showModal();
  document.querySelector(PREFERENCE_UI.CLOSE_BUTTON)?.focus();

  if (typeof announceStatus === 'function') {
    announceStatus('Preferences dialog opened.');
  }
}

function closePreferencesDialog() {
  const dialog = document.querySelector(PREFERENCE_UI.DIALOG);
  if (!dialog?.open) {
    return;
  }

  dialog.close();
  (preferencesDialogReturnFocusElement ?? document.querySelector(PREFERENCE_UI.BUTTON))?.focus?.();
  preferencesDialogReturnFocusElement = null;

  if (typeof announceStatus === 'function') {
    announceStatus('Preferences dialog closed.');
  }
}

function bindPreferencesUi() {
  const preferencesButton = document.querySelector(PREFERENCE_UI.BUTTON);
  const preferencesDialog = document.querySelector(PREFERENCE_UI.DIALOG);
  const closePreferencesButton = document.querySelector(PREFERENCE_UI.CLOSE_BUTTON);
  const hapticsToggle = document.querySelector(PREFERENCE_UI.HAPTICS_TOGGLE);
  const verboseToggle = document.querySelector(PREFERENCE_UI.VERBOSE_TOGGLE);

  if (!preferencesButton || !preferencesDialog) {
    return;
  }

  syncPreferencesUi();

  preferencesButton.addEventListener('click', openPreferencesDialog);
  closePreferencesButton?.addEventListener('click', closePreferencesDialog);

  preferencesDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closePreferencesDialog();
  });

  hapticsToggle?.addEventListener('change', (event) => {
    const enabled = Boolean(event.target.checked);
    setHapticsEnabled(enabled);

    if (typeof announceStatus === 'function') {
      announceStatus(`Haptic feedback ${enabled ? 'enabled' : 'disabled'}.`);
    }
  });

  verboseToggle?.addEventListener('change', (event) => {
    const verboseEnabled = Boolean(event.target.checked);
    const level = verboseEnabled ? ANNOUNCEMENT_LEVELS.VERBOSE : ANNOUNCEMENT_LEVELS.NORMAL;
    setAnnouncementLevel(level);

    if (typeof announceStatus === 'function') {
      announceStatus(`Announcement level set to ${level}.`);
    }
  });
}

document.addEventListener('DOMContentLoaded', bindPreferencesUi);

// Export for use in global scope
window.isHapticsEnabled = isHapticsEnabled;
window.setHapticsEnabled = setHapticsEnabled;
window.getAnnouncementLevel = getAnnouncementLevel;
window.setAnnouncementLevel = setAnnouncementLevel;
window.shouldAnnounce = shouldAnnounce;
window.ANNOUNCEMENT_LEVELS = ANNOUNCEMENT_LEVELS;
window.openPreferencesDialog = openPreferencesDialog;
window.closePreferencesDialog = closePreferencesDialog;

