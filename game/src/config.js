// Every tuning number and colour in one place. The playfield is a fixed
// 1000x1000 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size.
export const FIELD = { width: 1000, height: 1000 };
export const HUD_HEIGHT = 118;
export const BOARD_TOP = 132;
export const BOARD_SIZE = 840;

export const STEP = 1 / 60;

export const PALETTE = {
  backdrop: '#0d1026',
  backdrop2: '#141838',
  panel: '#1c2148',
  panelEdge: '#2e3670',
  grid: '#232a52',
  text: '#eef1ff',
  muted: '#9aa3c7',
  accent: '#7dd3fc',
  gold: '#f2d54c',
  wall: '#3a4266',
  mirror: '#d7e3ff',
  mirrorEdge: '#8ea2d8',
  locked: '#c9a86a',
  splitter: '#b79cff',
  beamGlow: 14,
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const BEST_KEY = 'lumen.best.score';
export const STARS_KEY = 'lumen.stars';
export const MUTE_KEY = 'lumen.muted';

// Stars for a finished level: 3 when the player used no more than par
// rotations, 2 within par + 2, else 1.
export function starsFor(rotations, par) {
  if (rotations <= par) return 3;
  if (rotations <= par + 2) return 2;
  return 1;
}
