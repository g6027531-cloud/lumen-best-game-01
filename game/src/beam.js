// Beam tracing for LUMEN: pure logic, no DOM, so the same code runs in the
// browser game and in the Node solver that proves every level solvable.
// A beam is a colour mask (red 1, green 2, blue 4) travelling in a direction.
// Mirrors: '/' sends N->E, E->N, S->W, W->S; '\' sends N->W, W->N, S->E, E->S.
// A prism ORs its colour into the beam. A splitter sends the beam left and right
// (perpendicular) and stops the straight beam. A target lights when the beam's
// mask covers the target's mask, and absorbs the beam. Walls stop the beam.
export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };

function reflect(dir, rot) {
  // rot 0 is '/', rot 1 is '\'.
  if (rot === 0) return { N: 'E', E: 'N', S: 'W', W: 'S' }[dir];
  return { N: 'W', W: 'N', S: 'E', E: 'S' }[dir];
}

export function colorCss(mask) {
  if (mask === 1) return '#ff5a5a';
  if (mask === 2) return '#4ade80';
  if (mask === 4) return '#5aa2ff';
  if (mask === 3) return '#f2d54c';
  if (mask === 5) return '#e879f9';
  if (mask === 6) return '#4dd8d8';
  if (mask === 7) return '#f5f0ff';
  return '#8b93a3';
}

// Trace every beam on the board. `rots` is an array over the level's rotatable
// mirrors (0 = '/', 1 = '\'). Returns the drawn segments (cell-centre to
// cell-centre, with colour), the set of lit target indices, and the set of
// lit cell keys for the renderer to glow.
export function traceBeams(board, rots) {
  const segments = [];
  const lit = new Set();
  const litCells = new Map();
  const queue = board.emitters.map((e) => ({ x: e.x, y: e.y, dir: e.dir, color: e.color }));
  const visited = new Set();
  while (queue.length > 0) {
    let beam = queue.shift();
    let guard = 0;
    while (guard < 600) {
      guard += 1;
      const [dx, dy] = DIRS[beam.dir];
      const nx = beam.x + dx;
      const ny = beam.y + dy;
      if (nx < 0 || ny < 0 || nx >= board.cols || ny >= board.rows) break;
      const vkey = `${nx},${ny},${beam.dir},${beam.color}`;
      if (visited.has(vkey)) break;
      visited.add(vkey);
      segments.push({ x0: beam.x, y0: beam.y, x1: nx, y1: ny, color: beam.color });
      const cellKey = `${nx},${ny}`;
      litCells.set(cellKey, (litCells.get(cellKey) ?? 0) | beam.color);
      const tile = board.tiles.get(cellKey);
      if (!tile || tile.type === 'emitter') {
        beam = { x: nx, y: ny, dir: beam.dir, color: beam.color };
        continue;
      }
      if (tile.type === 'wall') break;
      if (tile.type === 'target') {
        if ((beam.color & tile.color) === tile.color) lit.add(tile.index);
        break;
      }
      if (tile.type === 'prism') {
        beam = { x: nx, y: ny, dir: beam.dir, color: beam.color | tile.color };
        continue;
      }
      if (tile.type === 'mirror') {
        const rot = tile.locked ? tile.rot : rots[tile.id];
        beam = { x: nx, y: ny, dir: reflect(beam.dir, rot), color: beam.color };
        continue;
      }
      if (tile.type === 'splitter') {
        queue.push({ x: nx, y: ny, dir: LEFT[beam.dir], color: beam.color });
        queue.push({ x: nx, y: ny, dir: RIGHT[beam.dir], color: beam.color });
        break;
      }
      beam = { x: nx, y: ny, dir: beam.dir, color: beam.color };
    }
  }
  return { segments, lit, litCells };
}

export function isSolved(board, rots) {
  return traceBeams(board, rots).lit.size === board.targets.length;
}
