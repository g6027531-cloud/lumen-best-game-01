// LUMEN — 12 hand-designed levels. Legend for the grid strings:
//   '.' empty        '#' wall (blocks the beam)
//   '/' rotatable mirror, starts as '/'    '\' rotatable mirror, starts as '\'
//   'F' locked mirror '/'  'H' locked mirror '\'   'S' splitter (beam splits left+right)
//   'r'/'g'/'b' prism: the beam gains that colour as it passes through
//   'R'/'G'/'B' target red/green/blue, 'Y' yellow (red+green), 'C' cyan, 'M' magenta, 'W' white
//   'E' emitter cell (direction and colour live in `emitters`)
// Colours are bit masks: red 1, green 2, blue 4. A beam carries a mask; a prism ORs
// its colour in; a target lights when the beam's mask covers the target's mask.
// Every level was built by laying the mirrors out solved, then scrambling a few of
// them, so each one is solvable; tools/solve.mjs proves it and sets the energy budget.
export const RED = 1;
export const GREEN = 2;
export const BLUE = 4;

export const LEVELS = [
  {
    name: 'First Light',
    hint: 'Click the mirror to turn the beam. One turn is all it takes.',
    energy: 3, par: 1,
    grid: [
      '......',
      '......',
      'E../..',
      '......',
      '...R..',
      '......',
    ],
    emitters: [{ x: 0, y: 2, dir: 'E', color: RED }],
  },
  {
    name: 'Two Suns',
    hint: 'Two beams, two targets. Each mirror needs one turn.',
    energy: 4, par: 2,
    grid: [
      '......',
      'E./...',
      '......',
      '....\\G',
      '..R...',
      '....E.',
    ],
    emitters: [
      { x: 0, y: 1, dir: 'E', color: RED },
      { x: 4, y: 5, dir: 'N', color: GREEN },
    ],
  },
  {
    name: 'Golden Detour',
    hint: 'Red light through a green prism comes out yellow.',
    energy: 4, par: 2,
    grid: [
      '.......',
      '.......',
      '.......',
      'E./....',
      '.......',
      '../.g.Y',
      '.......',
    ],
    emitters: [{ x: 0, y: 3, dir: 'E', color: RED }],
  },
  {
    name: 'Split Decision',
    hint: 'A splitter sends one beam two ways. Steer both halves home.',
    energy: 4, par: 2,
    grid: [
      '.......',
      '...\\.R.',
      '.......',
      'E..S...',
      '.......',
      '.../.R.',
      '.......',
    ],
    emitters: [{ x: 0, y: 3, dir: 'E', color: RED }],
  },
  {
    name: 'Prism Twins',
    hint: 'Two beams, two prisms, two yellow targets. Mirror the pair.',
    energy: 6, par: 4,
    grid: [
      '........',
      'E../....',
      '........',
      '.../.g.Y',
      '...\\.r.Y',
      '........',
      'E..\\....',
      '........',
    ],
    emitters: [
      { x: 0, y: 1, dir: 'E', color: RED },
      { x: 0, y: 6, dir: 'E', color: GREEN },
    ],
  },
  {
    name: 'Crosswinds',
    hint: 'Red runs west to east, green east to west. Mind the walls.',
    energy: 6, par: 4,
    grid: [
      '........',
      '.....\\.G',
      '........',
      'E./.#...',
      '....#/..',
      '....#...',
      '../...R.',
      '........',
    ],
    emitters: [
      { x: 0, y: 3, dir: 'E', color: RED },
      { x: 7, y: 4, dir: 'W', color: GREEN },
    ],
  },
  {
    name: 'The Long Way',
    hint: 'Three turns carry the beam around the corner and back up.',
    energy: 5, par: 3,
    grid: [
      '.........',
      '.........',
      '.........',
      '......R..',
      'E../.#...',
      '.........',
      '.........',
      '.../..\\#.',
      '.........',
    ],
    emitters: [{ x: 0, y: 4, dir: 'E', color: RED }],
  },
  {
    name: 'Prism Garden',
    hint: 'Split the blue beam, then dye one half magenta.',
    energy: 5, par: 3,
    grid: [
      '...B.....',
      'E..S.....',
      '.........',
      '.........',
      '.../.r.M.',
      '.........',
      'E.../....',
      '.........',
      '..../...R',
    ],
    emitters: [
      { x: 0, y: 1, dir: 'E', color: BLUE },
      { x: 0, y: 6, dir: 'E', color: RED },
    ],
  },
  {
    name: 'Three Lights',
    hint: 'Red, green and blue each have their own road home.',
    energy: 6, par: 3,
    grid: [
      '.........',
      'E./......',
      '.........',
      '../..R/..',
      '.........',
      'E...\\....',
      '......\\.B',
      '..../...G',
      '.........',
    ],
    emitters: [
      { x: 0, y: 1, dir: 'E', color: RED },
      { x: 0, y: 5, dir: 'E', color: GREEN },
      { x: 8, y: 3, dir: 'W', color: BLUE },
    ],
  },
  {
    name: 'Mirror Maze',
    hint: 'Four turns in a row. One wrong mirror and the light is lost.',
    energy: 6, par: 4,
    grid: [
      '.........',
      '.........',
      '.........',
      '....\\..R.',
      'E./#.....',
      '.........',
      '../.\\.#..',
      '.........',
      '.........',
    ],
    emitters: [{ x: 0, y: 4, dir: 'E', color: RED }],
  },
  {
    name: 'Spectrum',
    hint: 'Red light must gather green and blue to become white.',
    energy: 6, par: 4,
    grid: [
      '..........',
      '..........',
      '.......\\..',
      '..........',
      '..........',
      'E./..../.G',
      '..........',
      '..........',
      '../.g.b.W.',
      '..........',
    ],
    emitters: [
      { x: 0, y: 5, dir: 'E', color: RED },
      { x: 9, y: 2, dir: 'W', color: GREEN },
    ],
  },
  {
    name: 'Grand Finale',
    hint: 'Everything at once: a split, two prisms, and five turns.',
    energy: 7, par: 4,
    grid: [
      '...R......',
      '..........',
      'E..S......',
      '..........',
      '..........',
      '.../.b.M..',
      '../..B.\\.G',
      '..........',
      'E.\\..../..',
      '..........',
    ],
    emitters: [
      { x: 0, y: 2, dir: 'E', color: RED },
      { x: 0, y: 8, dir: 'E', color: BLUE },
      { x: 9, y: 8, dir: 'W', color: GREEN },
    ],
  },
];

// Turn a level definition into a playable board: a map of tiles, the list of
// rotatable mirrors (each with its starting orientation), and the targets.
export function parseLevel(def) {
  const rows = def.grid.length;
  const cols = def.grid[0].length;
  const tiles = new Map();
  const mirrors = [];
  const targets = [];
  const targetColor = { R: 1, G: 2, B: 4, Y: 3, C: 6, M: 5, W: 7 };
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const ch = def.grid[y][x];
      const key = `${x},${y}`;
      if (ch === '.') continue;
      if (ch === '#') tiles.set(key, { type: 'wall', x, y });
      else if (ch === '/') {
        const id = mirrors.length;
        mirrors.push({ id, x, y, rot: 0, locked: false });
        tiles.set(key, { type: 'mirror', x, y, id, locked: false });
      } else if (ch === '\\') {
        const id = mirrors.length;
        mirrors.push({ id, x, y, rot: 1, locked: false });
        tiles.set(key, { type: 'mirror', x, y, id, locked: false });
      } else if (ch === 'F') tiles.set(key, { type: 'mirror', x, y, id: -1, locked: true, rot: 0 });
      else if (ch === 'H') tiles.set(key, { type: 'mirror', x, y, id: -1, locked: true, rot: 1 });
      else if (ch === 'S') tiles.set(key, { type: 'splitter', x, y });
      else if (ch === 'r') tiles.set(key, { type: 'prism', x, y, color: RED });
      else if (ch === 'g') tiles.set(key, { type: 'prism', x, y, color: GREEN });
      else if (ch === 'b') tiles.set(key, { type: 'prism', x, y, color: BLUE });
      else if (ch === 'E') tiles.set(key, { type: 'emitter', x, y });
      else if (targetColor[ch] !== undefined) {
        const index = targets.length;
        targets.push({ index, x, y, color: targetColor[ch] });
        tiles.set(key, { type: 'target', x, y, color: targetColor[ch], index });
      }
    }
  }
  return { ...def, cols, rows, tiles, mirrors, targets };
}
