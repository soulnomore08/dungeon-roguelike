const SAVE_KEY = 'dungeon_roguelike_save';

export const DIFFICULTIES = {
  easy:   { label: 'Easy',   enemyHpMult: 0.7, enemyDmgMult: 0.6, xpMult: 1.3 },
  medium: { label: 'Medium', enemyHpMult: 1.0, enemyDmgMult: 1.0, xpMult: 1.0 },
  hard:   { label: 'Hard',   enemyHpMult: 1.5, enemyDmgMult: 1.4, xpMult: 0.85 },
};

export function hasSave() {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch (e) {
    return false;
  }
}

export function saveGame(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Save failed', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) { /* ignore */ }
}
