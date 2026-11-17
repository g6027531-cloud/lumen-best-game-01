// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between seven screens: title, level select, play, paused, level complete,
// game over and victory.
//
// ?seed=N fixes the shimmer. ?shot=start|play|paused|complete (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STARS_KEY, STEP } from './config.js';
import { createGame, EVENT_LIT, EVENT_LOSE, EVENT_ROTATE, EVENT_WIN } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_MENU,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  ACTION_UNDO,
  createInput,
} from './input.js';
import { createSound } from './sound.js';
import {
  SCREEN_COMPLETE,
  SCREEN_LEVELS,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
  createRenderer,
} from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 1;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function readStars() {
  try {
    return JSON.parse(window.localStorage.getItem(STARS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveStars(map) {
  try {
    window.localStorage.setItem(STARS_KEY, JSON.stringify(map));
  } catch {
    // Storage can be off; stars then last this visit only.
  }
}

function runShot(name) {
  const screen = stageShot(name, game);
  const s = game.state();
  let painted = 0;
  function paint() {
    renderer.draw(s, screen, { t: 1.5, muted: sound.muted, best: readBest(), stars: readStars(), cursor: null });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let previousScreen = SCREEN_PLAY;
  let best = readBest();
  let stars = readStars();
  let lastDraw = { buttons: [], geom: null };
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function recordWin(s) {
    stars[s.levelIndex] = Math.max(stars[s.levelIndex] ?? 0, s.stars);
    saveStars(stars);
    if (s.score > best) {
      best = s.score;
      saveBest(best);
    }
  }

  function startLevel(index) {
    game.loadLevel(index);
    screen = SCREEN_PLAY;
    announce(`Level ${index + 1}: ${game.state().level.name}. ${game.state().level.hint}`);
  }

  function cellFromClick(click) {
    const geom = lastDraw.geom;
    if (!geom) return null;
    const s = game.state();
    const gx = Math.floor((click.x - geom.x0) / geom.cell);
    const gy = Math.floor((click.y - geom.y0) / geom.cell);
    if (gx < 0 || gy < 0 || gx >= s.board.cols || gy >= s.board.rows) return null;
    return { x: gx, y: gy };
  }

  function handleClick(click) {
    sound.unlock();
    for (const b of lastDraw.buttons) {
      if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
        sound.click();
        return handleButton(b.id);
      }
    }
    if (screen !== SCREEN_PLAY) return;
    const cell = cellFromClick(click);
    if (!cell) return;
    input.cursor.x = cell.x;
    input.cursor.y = cell.y;
    rotateAt(cell.x, cell.y);
  }

  function rotateAt(x, y) {
    const events = game.rotate(x, y);
    if (events & EVENT_ROTATE) sound.rotate();
    if (events & EVENT_LIT) sound.lit();
    if (events & EVENT_WIN) {
      const s = game.state();
      recordWin(s);
      sound.win();
      screen = s.levelIndex + 1 < 12 ? SCREEN_COMPLETE : SCREEN_VICTORY;
      announce(`Level complete. Score ${s.score}.`);
    } else if (events & EVENT_LOSE) {
      sound.lose();
      screen = SCREEN_OVER;
      announce('Out of energy. Press R to try again.');
    }
  }

  function handleButton(id) {
    if (id === 'start') {
      startLevel(0);
    } else if (id === 'menu' || id === 'menu2') {
      previousScreen = screen;
      screen = SCREEN_LEVELS;
    } else if (id === 'close-levels') {
      screen = previousScreen === SCREEN_TITLE ? SCREEN_TITLE : SCREEN_PLAY;
    } else if (id.startsWith('level-')) {
      startLevel(Number.parseInt(id.slice(6), 10));
    } else if (id === 'undo') {
      if (game.undo()) sound.click();
    } else if (id === 'restart' || id === 'again') {
      game.restart();
      screen = SCREEN_PLAY;
      announce('Level restarted.');
    } else if (id === 'pause') {
      if (screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
    } else if (id === 'resume') {
      screen = SCREEN_PLAY;
    } else if (id === 'mute') {
      sound.toggle();
    } else if (id === 'next') {
      startLevel(game.state().levelIndex + 1);
    } else if (id === 'replay') {
      game.restart();
      screen = SCREEN_PLAY;
    } else if (id === 'victory' || id === 'again-all') {
      window.location.reload();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) sound.toggle();
    if (screen === SCREEN_TITLE) {
      if (actions & ACTION_CONFIRM) startLevel(0);
      else if (actions & ACTION_MENU) screen = SCREEN_LEVELS;
      return;
    }
    if (screen === SCREEN_LEVELS) {
      if (actions & (ACTION_CONFIRM | ACTION_PAUSE | ACTION_MENU)) screen = previousScreen;
      return;
    }
    if (screen === SCREEN_PAUSED) {
      if (actions & ACTION_PAUSE) screen = SCREEN_PLAY;
      else if (actions & ACTION_RESTART) {
        game.restart();
        screen = SCREEN_PLAY;
      } else if (actions & ACTION_CONFIRM) screen = SCREEN_PLAY;
      return;
    }
    if (screen === SCREEN_COMPLETE) {
      if (actions & ACTION_CONFIRM) {
        const s = game.state();
        if (s.levelIndex + 1 < 12) startLevel(s.levelIndex + 1);
        else window.location.reload();
      }
      return;
    }
    if (screen === SCREEN_OVER) {
      if (actions & (ACTION_CONFIRM | ACTION_RESTART)) {
        game.restart();
        screen = SCREEN_PLAY;
      }
      return;
    }
    if (screen === SCREEN_VICTORY) {
      if (actions & ACTION_CONFIRM) window.location.reload();
      return;
    }
    // SCREEN_PLAY
    if (actions & ACTION_PAUSE) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & ACTION_UNDO) {
      if (game.undo()) sound.click();
    } else if (actions & ACTION_RESTART) {
      game.restart();
      announce('Level restarted.');
    } else if (actions & ACTION_MENU) {
      previousScreen = SCREEN_PLAY;
      screen = SCREEN_LEVELS;
    } else if (actions & ACTION_CONFIRM) {
      rotateAt(input.cursor.x, input.cursor.y);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const t = now / 1000;
    accumulator += Math.min((now - last) / 1000, 0.25);
    last = now;
    const click = input.takeClick();
    if (click) handleClick(click);
    handleActions();
    const s = game.state();
    if (screen === SCREEN_PLAY) {
      input.moveCursor(s.board.cols, s.board.rows);
      while (accumulator >= STEP) {
        game.tick(STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    lastDraw = renderer.draw(s, screen, {
      t,
      muted: sound.muted,
      best,
      stars,
      cursor: screen === SCREEN_PLAY ? input.cursor : null,
    });
  }

  announce('LUMEN. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
