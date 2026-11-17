// The screenshot scenes behind ?shot=start|play|paused|complete. Each one
// plays the real rules from a fresh board, so the frame is what a short game
// really looks like and the same seed always gives the same frame.
import { SCREEN_COMPLETE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

// name -> [level index, rotations to apply as [x, y] pairs, screen]
const SCENES = {
  start: [0, [], SCREEN_TITLE],
  play: [2, [[2, 3]], SCREEN_PLAY],
  paused: [1, [[2, 1]], SCREEN_PAUSED],
  complete: [0, [[3, 2]], SCREEN_COMPLETE],
};

export function stageShot(name, game) {
  const scene = SCENES[name] ?? SCENES.start;
  const [levelIndex, turns, screen] = scene;
  game.loadLevel(levelIndex);
  for (const [x, y] of turns) game.rotate(x, y);
  return screen;
}
