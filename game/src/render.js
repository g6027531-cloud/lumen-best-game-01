// Drawing only: the board, the beams, the HUD and every screen, on a
// 1000x1000 logical canvas the browser scales to the window. draw() returns
// the clickable buttons it painted (in logical coordinates) so input can
// hit-test them. No game rules live here.
import { BOARD_SIZE, BOARD_TOP, FIELD, FONT, HUD_HEIGHT, PALETTE } from './config.js';
import { colorCss } from './beam.js';

export const SCREEN_TITLE = 0;
export const SCREEN_LEVELS = 1;
export const SCREEN_PLAY = 2;
export const SCREEN_PAUSED = 3;
export const SCREEN_COMPLETE = 4;
export const SCREEN_OVER = 5;
export const SCREEN_VICTORY = 6;

const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStar(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function cellGeom(board) {
  const cell = Math.min(BOARD_SIZE / board.cols, (FIELD.height - BOARD_TOP - 28) / board.rows);
  const w = cell * board.cols;
  const h = cell * board.rows;
  return { cell, x0: (FIELD.width - w) / 2, y0: BOARD_TOP + ((FIELD.height - BOARD_TOP - 28 - h) / 2) };
}

function centre(geom, x, y) {
  return { x: geom.x0 + (x + 0.5) * geom.cell, y: geom.y0 + (y + 0.5) * geom.cell };
}

function drawMirror(ctx, cx, cy, r, rot, locked) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = locked ? '#3d2f16' : '#232a52';
  rr(ctx, -r, -r, r * 2, r * 2, r * 0.25);
  ctx.fill();
  ctx.strokeStyle = locked ? PALETTE.locked : PALETTE.mirrorEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  if (rot === 0) {
    ctx.moveTo(r * 0.62, -r * 0.62);
    ctx.lineTo(-r * 0.62, r * 0.62);
  } else {
    ctx.moveTo(-r * 0.62, -r * 0.62);
    ctx.lineTo(r * 0.62, r * 0.62);
  }
  ctx.strokeStyle = locked ? PALETTE.locked : PALETTE.mirror;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
  if (locked) {
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.locked;
    ctx.fill();
  }
  ctx.restore();
}

function drawPrism(ctx, cx, cy, r, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.9, cy + r * 0.6);
  ctx.lineTo(cx - r * 0.9, cy + r * 0.6);
  ctx.closePath();
  ctx.fillStyle = colorCss(color);
  ctx.shadowColor = colorCss(color);
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTarget(ctx, cx, cy, r, color, lit, t) {
  const css = colorCss(color);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = lit ? css : '#1c2148';
  ctx.shadowColor = css;
  ctx.shadowBlur = lit ? 16 + 6 * Math.sin(t * 3) : 0;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
  ctx.strokeStyle = css;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = lit ? '#0d1026' : css;
  ctx.fill();
  if (lit) {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.22, cy);
    ctx.lineTo(cx - r * 0.05, cy + r * 0.2);
    ctx.lineTo(cx + r * 0.28, cy - r * 0.22);
    ctx.strokeStyle = '#0d1026';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function drawEmitter(ctx, cx, cy, r, dir, color, t) {
  const css = colorCss(color);
  const pulse = 1 + 0.08 * Math.sin(t * 4);
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
  ctx.fillStyle = css;
  ctx.shadowColor = css;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
  const [dx, dy] = DIRS[dir];
  ctx.beginPath();
  ctx.moveTo(cx + dx * r * 0.55, cy + dy * r * 0.55);
  ctx.lineTo(cx - dy * r * 0.4 - dx * r * 0.25, cy + dx * r * 0.4 - dy * r * 0.25);
  ctx.lineTo(cx + dy * r * 0.4 - dx * r * 0.25, cy - dx * r * 0.4 - dy * r * 0.25);
  ctx.closePath();
  ctx.fillStyle = '#0d1026';
  ctx.fill();
}

function drawSplitter(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#2a2350';
  ctx.strokeStyle = PALETTE.splitter;
  ctx.lineWidth = 2.5;
  const s = r * 0.72;
  ctx.beginPath();
  ctx.rect(-s, -s, s * 2, s * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.splitter;
  ctx.fill();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform((canvas.width / FIELD.width) * 1, 0, 0, canvas.height / FIELD.height, 0, 0);
  }

  function board(s) {
    const geom = cellGeom(s.board);
    const { cell } = geom;
    // Board panel.
    ctx.fillStyle = PALETTE.panel;
    rr(ctx, geom.x0 - 14, geom.y0 - 14, cell * s.board.cols + 28, cell * s.board.rows + 28, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Grid.
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= s.board.cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(geom.x0 + x * cell, geom.y0);
      ctx.lineTo(geom.x0 + x * cell, geom.y0 + cell * s.board.rows);
      ctx.stroke();
    }
    for (let y = 0; y <= s.board.rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(geom.x0, geom.y0 + y * cell);
      ctx.lineTo(geom.x0 + cell * s.board.cols, geom.y0 + y * cell);
      ctx.stroke();
    }
    return geom;
  }

  function beams(s, geom, t) {
    const { cell } = geom;
    ctx.save();
    ctx.lineCap = 'round';
    for (const seg of s.beams.segments) {
      const a = centre(geom, seg.x0, seg.y0);
      const b = centre(geom, seg.x1, seg.y1);
      const css = colorCss(seg.color);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = css;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = cell * 0.22;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowColor = css;
      ctx.shadowBlur = PALETTE.beamGlow;
      ctx.lineWidth = cell * 0.1;
      ctx.setLineDash([cell * 0.28, cell * 0.22]);
      ctx.lineDashOffset = -t * cell * 0.9;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function tiles(s, geom, t, cursor) {
    const { cell } = geom;
    const r = cell * 0.42;
    for (const tile of s.board.tiles.values()) {
      const c = centre(geom, tile.x, tile.y);
      if (tile.type === 'wall') {
        ctx.fillStyle = PALETTE.wall;
        rr(ctx, c.x - r, c.y - r, r * 2, r * 2, 6);
        ctx.fill();
      } else if (tile.type === 'mirror') {
        const rot = tile.locked ? tile.rot : s.rots[tile.id];
        drawMirror(ctx, c.x, c.y, r, rot, tile.locked);
      } else if (tile.type === 'splitter') {
        drawSplitter(ctx, c.x, c.y, r);
      } else if (tile.type === 'prism') {
        drawPrism(ctx, c.x, c.y, r * 0.8, tile.color);
      } else if (tile.type === 'target') {
        drawTarget(ctx, c.x, c.y, r * 0.85, tile.color, s.beams.lit.has(tile.index), t);
      }
    }
    for (const e of s.board.emitters) {
      const c = centre(geom, e.x, e.y);
      drawEmitter(ctx, c.x, c.y, r * 0.62, e.dir, e.color, t);
    }
    if (cursor && cursor.x >= 0 && cursor.y >= 0 && cursor.x < s.board.cols && cursor.y < s.board.rows) {
      const c = centre(geom, cursor.x, cursor.y);
      ctx.strokeStyle = PALETTE.accent;
      ctx.lineWidth = 3;
      rr(ctx, c.x - r, c.y - r, r * 2, r * 2, 8);
      ctx.stroke();
    }
  }

  function hud(s, muted) {
    ctx.fillStyle = PALETTE.panel;
    rr(ctx, 16, 14, FIELD.width - 32, HUD_HEIGHT, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 30px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('LUMEN', 38, 44);
    ctx.font = `400 17px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(`Level ${s.levelIndex + 1} / 12  ·  ${s.level.name}`, 38, 76);
    ctx.font = `400 15px ${FONT}`;
    ctx.fillText(s.level.hint, 38, 100);
    // Targets, energy, score, time on the right.
    ctx.textAlign = 'right';
    ctx.font = `700 22px ${FONT}`;
    ctx.fillStyle = s.litCount === s.targetCount ? PALETTE.gold : PALETTE.text;
    ctx.fillText(`Targets ${s.litCount}/${s.targetCount}`, FIELD.width - 38, 40);
    ctx.font = `400 17px ${FONT}`;
    ctx.fillStyle = s.energy <= 2 ? '#ff7a7a' : PALETTE.text;
    ctx.fillText(`Energy ${'●'.repeat(Math.max(0, s.energy))}${'○'.repeat(Math.max(0, s.board.energy - s.energy))}`, FIELD.width - 38, 68);
    ctx.fillStyle = PALETTE.muted;
    const mins = Math.floor(s.elapsed / 60);
    const secs = Math.floor(s.elapsed % 60);
    ctx.fillText(`Score ${s.score}   ${mins}:${String(secs).padStart(2, '0')}`, FIELD.width - 38, 94);
    ctx.textAlign = 'left';
  }

  function button(id, x, y, w, h, label, primary) {
    ctx.fillStyle = primary ? PALETTE.accent : '#2a3054';
    rr(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = primary ? '#bfe9ff' : PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = primary ? '#0d1026' : PALETTE.text;
    ctx.font = `700 19px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    ctx.textAlign = 'left';
    return { id, x, y, w, h };
  }

  function overlay(title, lines) {
    ctx.fillStyle = 'rgba(7, 9, 24, 0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.panel;
    rr(ctx, 190, 250, FIELD.width - 380, 500, 20);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, FIELD.width / 2, 316);
    ctx.font = `400 19px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    let y = 372;
    for (const line of lines) {
      ctx.fillText(line, FIELD.width / 2, y);
      y += 30;
    }
    ctx.textAlign = 'left';
    return y;
  }

  function draw(s, screen, opts) {
    fit();
    const t = opts.t ?? 0;
    const buttons = [];
    // Backdrop.
    const grad = ctx.createLinearGradient(0, 0, 0, FIELD.height);
    grad.addColorStop(0, PALETTE.backdrop);
    grad.addColorStop(1, PALETTE.backdrop2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    if (screen === SCREEN_TITLE) {
      const geom = board(s);
      beams(s, geom, t);
      tiles(s, geom, t, null);
      ctx.fillStyle = 'rgba(7, 9, 24, 0.78)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `700 110px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('LUMEN', FIELD.width / 2, 300);
      ctx.font = `400 26px ${FONT}`;
      ctx.fillStyle = PALETTE.accent;
      ctx.fillText('A puzzle of light  ·  turn mirrors, bend beams, wake the prisms', FIELD.width / 2, 362);
      ctx.font = `400 20px ${FONT}`;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText('Click a mirror to turn it. Light every target before the energy runs out.', FIELD.width / 2, 412);
      ctx.fillText('12 levels  ·  keyboard: arrows move, Space turns, U undoes, P pauses', FIELD.width / 2, 446);
      if (opts.best > 0) {
        ctx.fillStyle = PALETTE.gold;
        ctx.font = `700 22px ${FONT}`;
        ctx.fillText(`Best score ${opts.best}`, FIELD.width / 2, 492);
      }
      buttons.push(button('start', FIELD.width / 2 - 130, 545, 260, 62, 'START  ·  SPACE', true));
      ctx.textAlign = 'left';
      return { buttons, geom };
    }
    hud(s, opts.muted);
    const geom = board(s);
    beams(s, geom, t);
    tiles(s, geom, t, opts.cursor ?? null);
    // HUD buttons row under the board.
    const by = geom.y0 + geom.cell * s.board.rows + 34;
    buttons.push(button('menu', geom.x0, by, 130, 46, 'LEVELS', false));
    buttons.push(button('undo', geom.x0 + 146, by, 130, 46, 'UNDO (U)', false));
    buttons.push(button('restart', geom.x0 + 292, by, 130, 46, 'RESTART (R)', false));
    buttons.push(button('pause', geom.x0 + 438, by, 130, 46, 'PAUSE (P)', false));
    buttons.push(button('mute', geom.x0 + 584, by, 130, 46, opts.muted ? 'SOUND OFF' : 'SOUND ON', false));
    if (screen === SCREEN_LEVELS) {
      ctx.fillStyle = 'rgba(7, 9, 24, 0.78)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `700 40px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('Choose a level', FIELD.width / 2, 190);
      ctx.textAlign = 'left';
      const stars = opts.stars ?? {};
      for (let i = 0; i < 12; i += 1) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 170 + col * 175;
        const y = 240 + row * 150;
        const unlocked = i === 0 || (stars[i - 1] ?? 0) > 0;
        ctx.fillStyle = unlocked ? PALETTE.panel : '#171a30';
        rr(ctx, x, y, 155, 125, 14);
        ctx.fill();
        ctx.strokeStyle = PALETTE.panelEdge;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = unlocked ? PALETTE.text : PALETTE.muted;
        ctx.font = `700 26px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, x + 77, y + 44);
        ctx.font = `400 15px ${FONT}`;
        ctx.fillText(LEVELS_NAMES[i], x + 77, y + 76);
        const st = stars[i] ?? 0;
        for (let k = 0; k < 3; k += 1) {
          drawStar(ctx, x + 52 + k * 26, y + 104, 9, k < st ? PALETTE.gold : '#2a3054');
        }
        ctx.textAlign = 'left';
        if (unlocked) buttons.push({ id: `level-${i}`, x, y, w: 155, h: 125 });
      }
      buttons.push(button('close-levels', FIELD.width / 2 - 90, 720, 180, 52, 'CLOSE', true));
    } else if (screen === SCREEN_PAUSED) {
      const y = overlay('Paused', ['Take a breath. The light waits for you.', 'P resume  ·  R restart  ·  U undo']);
      buttons.push(button('resume', FIELD.width / 2 - 200, y + 24, 190, 56, 'RESUME', true));
      buttons.push(button('restart', FIELD.width / 2 + 10, y + 24, 190, 56, 'RESTART', false));
    } else if (screen === SCREEN_COMPLETE) {
      const y = overlay('Level Complete', [
        `${s.level.name}  ·  ${s.moves} turns  ·  par ${s.level.par}`,
        `Level score +${s.levelScore}  ·  total ${s.score}`,
      ]);
      for (let k = 0; k < 3; k += 1) {
        drawStar(ctx, FIELD.width / 2 - 52 + k * 52, y + 22, 20, k < s.stars ? PALETTE.gold : '#2a3054');
      }
      if (s.levelIndex + 1 < 12) buttons.push(button('next', FIELD.width / 2 - 200, y + 62, 190, 56, 'NEXT LEVEL', true));
      else buttons.push(button('victory', FIELD.width / 2 - 200, y + 62, 190, 56, 'FINISH', true));
      buttons.push(button('replay', FIELD.width / 2 + 10, y + 62, 190, 56, 'REPLAY', false));
    } else if (screen === SCREEN_OVER) {
      const y = overlay('Out of Energy', ['Every target went dark. The mirrors can be turned again.', `${s.litCount}/${s.targetCount} targets lit  ·  ${s.moves} turns used`]);
      buttons.push(button('again', FIELD.width / 2 - 200, y + 24, 190, 56, 'TRY AGAIN', true));
      buttons.push(button('menu2', FIELD.width / 2 + 10, y + 24, 190, 56, 'LEVELS', false));
    } else if (screen === SCREEN_VICTORY) {
      const y = overlay('All Twelve Lit', [`You finished LUMEN with ${s.score} points.`, 'Every prism woke. Every target shone.']);
      buttons.push(button('again-all', FIELD.width / 2 - 130, y + 24, 260, 56, 'PLAY AGAIN', true));
    }
    return { buttons, geom };
  }

  return { draw, cellGeom };
}

const LEVELS_NAMES = [
  'First Light', 'Two Suns', 'Golden Detour', 'Split Decision',
  'Prism Twins', 'Crosswinds', 'The Long Way', 'Prism Garden',
  'Three Lights', 'Mirror Maze', 'Spectrum', 'Grand Finale',
];
