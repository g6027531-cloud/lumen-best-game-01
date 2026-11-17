// Keyboard and pointer input. One-shot presses (start, pause, undo,
// restart, mute) are queued as bit flags and taken once by the loop, so a
// press between two frames is never lost and never counted twice. Arrow keys
// move a board cursor; Space/Enter turns the mirror under it.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_UNDO = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_MENU = 32;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const UNDO = new Set(['KeyU']);
const RESTART = new Set(['KeyR']);
const MUTE = new Set(['KeyM']);
const MENU = new Set(['KeyL']);

export function createInput(target) {
  let actions = 0;
  let cursor = { x: 0, y: 0 };
  let clicked = null;
  let left = false;
  let right = false;
  let up = false;
  let down = false;

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (CONFIRM.has(event.code)) actions |= ACTION_CONFIRM;
    else if (PAUSE.has(event.code)) actions |= ACTION_PAUSE;
    else if (UNDO.has(event.code)) actions |= ACTION_UNDO;
    else if (RESTART.has(event.code)) actions |= ACTION_RESTART;
    else if (MUTE.has(event.code)) actions |= ACTION_MUTE;
    else if (MENU.has(event.code)) actions |= ACTION_MENU;
    else if (event.code === 'ArrowLeft' || event.code === 'KeyA') left = true;
    else if (event.code === 'ArrowRight' || event.code === 'KeyD') right = true;
    else if (event.code === 'ArrowUp' || event.code === 'KeyW') up = true;
    else if (event.code === 'ArrowDown' || event.code === 'KeyS') down = true;
    else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') left = false;
    else if (event.code === 'ArrowRight' || event.code === 'KeyD') right = false;
    else if (event.code === 'ArrowUp' || event.code === 'KeyW') up = false;
    else if (event.code === 'ArrowDown' || event.code === 'KeyS') down = false;
  });
  window.addEventListener('blur', () => {
    left = false;
    right = false;
    up = false;
    down = false;
  });
  target.addEventListener('pointerdown', (event) => {
    const rect = target.getBoundingClientRect();
    clicked = {
      x: ((event.clientX - rect.left) / rect.width) * 1000,
      y: ((event.clientY - rect.top) / rect.height) * 1000,
    };
  });

  return {
    cursor,
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const c = clicked;
      clicked = null;
      return c;
    },
    moveCursor(cols, rows) {
      if (left) cursor.x = Math.max(0, cursor.x - 1);
      if (right) cursor.x = Math.min(cols - 1, cursor.x + 1);
      if (up) cursor.y = Math.max(0, cursor.y - 1);
      if (down) cursor.y = Math.min(rows - 1, cursor.y + 1);
      left = false;
      right = false;
      up = false;
      down = false;
    },
  };
}
