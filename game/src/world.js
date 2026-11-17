// LUMEN's rules and state, with no drawing and no browser in it: the board,
// the mirrors, the energy budget, undo, score and win/lose. Rotating a mirror
// costs 1 energy; lighting every target wins the level. The world never
// touches the screen; the caller reads `beams` after every change.
import { LEVELS, parseLevel } from './levels.js';
import { traceBeams } from './beam.js';

export const EVENT_ROTATE = 1;
export const EVENT_LIT = 2;
export const EVENT_WIN = 4;
export const EVENT_LOSE = 8;

export function createGame() {
  let levelIndex = 0;
  let board = parseLevel(LEVELS[0]);
  let rots = board.mirrors.map((m) => m.rot);
  let energy = board.energy;
  let moves = 0;
  let score = 0;
  let elapsed = 0;
  let beams = traceBeams(board, rots);
  let undoStack = [];
  let won = false;
  let lost = false;
  let stars = 0;
  let levelScore = 0;

  function refresh() {
    beams = traceBeams(board, rots);
  }

  function loadLevel(index) {
    levelIndex = index;
    board = parseLevel(LEVELS[index]);
    rots = board.mirrors.map((m) => m.rot);
    energy = board.energy;
    moves = 0;
    elapsed = 0;
    undoStack = [];
    won = false;
    lost = false;
    stars = 0;
    levelScore = 0;
    refresh();
  }

  function mirrorAt(x, y) {
    const tile = board.tiles.get(`${x},${y}`);
    if (!tile || tile.type !== 'mirror' || tile.locked) return null;
    return tile;
  }

  function rotate(x, y) {
    if (won || lost || energy <= 0) return 0;
    const tile = mirrorAt(x, y);
    if (!tile) return 0;
    undoStack.push({ rots: rots.slice(), energy, moves });
    if (undoStack.length > 200) undoStack.shift();
    const before = beams.lit.size;
    rots[tile.id] = 1 - rots[tile.id];
    energy -= 1;
    moves += 1;
    refresh();
    let events = EVENT_ROTATE;
    if (beams.lit.size > before) events |= EVENT_LIT;
    if (beams.lit.size === board.targets.length) {
      won = true;
      const par = board.par;
      stars = moves <= par ? 3 : moves <= par + 2 ? 2 : 1;
      levelScore = 500 + 100 * energy + Math.max(0, 300 - Math.floor(elapsed) * 2);
      score += levelScore;
      events |= EVENT_WIN;
    } else if (energy === 0) {
      lost = true;
      events |= EVENT_LOSE;
    }
    return events;
  }

  function undo() {
    const snap = undoStack.pop();
    if (!snap) return false;
    rots = snap.rots;
    energy = snap.energy;
    moves = snap.moves;
    won = false;
    lost = false;
    refresh();
    return true;
  }

  function restart() {
    loadLevel(levelIndex);
  }

  function tick(dt) {
    elapsed += dt;
  }

  function state() {
    return {
      levelIndex,
      level: LEVELS[levelIndex],
      board,
      rots,
      energy,
      moves,
      score,
      elapsed,
      beams,
      won,
      lost,
      stars,
      levelScore,
      canUndo: undoStack.length > 0,
      litCount: beams.lit.size,
      targetCount: board.targets.length,
    };
  }

  loadLevel(0);
  return { state, loadLevel, rotate, undo, restart, tick, mirrorAt };
}
