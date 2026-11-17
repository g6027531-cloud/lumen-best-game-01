# LUMEN — a puzzle of light

[![make.fun](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01)
[![rank](https://make.fun/badge/best-game-01/g6027531-cloud/lumen-best-game-01/rank.svg)](https://make.fun/bounty/best-game-01)
[![reward](https://make.fun/badge/best-game-01/g6027531-cloud/lumen-best-game-01/reward.svg)](https://make.fun/bounty/best-game-01)

> Replace `g6027531-cloud/lumen-best-game-01` in the rank and reward badges above with this
> repository's real owner and name before submitting.

Turn the mirrors, bend the beams, wake the prisms. **LUMEN** is an original
light-bending puzzle game for [make.fun's best-game-01 bounty](https://make.fun/bounty/best-game-01):
12 hand-built levels in which coloured beams leave glowing emitters and you
rotate mirrors to guide them to their targets. A prism adds its colour to a
beam that passes through — red + green makes yellow, red + blue makes
magenta, green + blue makes cyan, all three make white — and a splitter
sends one beam two ways. Light every target before the energy runs out.

## How to play

- Click a mirror to turn it 90 degrees (1 energy per turn). Locked mirrors
  with a gold rim never turn.
- Keyboard: arrow keys or WASD move the cursor, Space or Enter turns the
  mirror under it, U undoes a turn, R restarts the level, P pauses,
  M toggles sound, L opens the level list.
- Finish a level in par turns for 3 stars. Your best score is kept in the
  browser's local storage.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

The game is plain static files under `game/` — no build step, no network
request, no library. It runs offline in a desktop browser.

## Files

- `game/index.html` — the page; `game/src/main.js` — boot and game loop.
- `game/src/levels.js` — the 12 levels. `game/src/beam.js` — beam tracing.
- `game/src/world.js` — rules: energy, undo, score, win and lose.
- `game/src/render.js` — drawing: board, beams, HUD and screens.
- `game/src/input.js`, `game/src/sound.js` (synthesized, no audio files),
  `game/src/shots.js`, `game/src/random.js`, `game/src/readme.txt`.
- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored
  `vendor/makefun-game.ts`. `serve.ts` — a tiny static server for local play.
- `screenshots/` — 4 renders of the game taken in a browser
  (title, playing, paused, level complete), 1000×1000 PNG.

## License

MIT — see [LICENSE](LICENSE).
