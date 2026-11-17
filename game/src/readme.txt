LUMEN — a puzzle of light
============================
Turn the mirrors, bend the beams, wake the prisms.

Goal: light every target with the colour it asks for before the energy
runs out. Each mirror turn costs 1 energy.

How to play
-----------
- Click a mirror to turn it 90 degrees. Locked mirrors (gold rim) never turn.
- Beams leave the glowing emitters. A mirror bends a beam. A splitter sends
  one beam two ways. A prism adds its colour to a beam that passes through:
  red + green makes yellow, red + blue makes magenta, green + blue makes
  cyan, all three make white.
- A target lights when a beam carrying its colour reaches it, and the beam
  stops there. Light every target to finish the level.
- 12 levels. Finish a level in par turns for 3 stars. Your best score is
  kept in this browser.

Controls
--------
- Mouse: click a mirror to turn it; click the buttons below the board.
- Keyboard: arrow keys (or WASD) move the cursor, Space or Enter turns the
  mirror under it, U undoes a turn, R restarts the level, P pauses,
  M toggles sound, L opens the level list.

Files
-----
- src/levels.js — the 12 levels, each a hand-built board.
- src/beam.js — the beam tracer: mirrors, prisms, splitters, targets.
- src/world.js — the rules: energy, undo, score, win and lose.
- src/render.js — all drawing: board, beams, HUD and screens.
- src/input.js, src/sound.js, src/shots.js, src/main.js, src/random.js.
- Everything the game loads is a file under game/ or a data: URI; it makes
  no network request and runs offline in a desktop browser.
