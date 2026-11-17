// Tiny synthesized sound: every note is an oscillator, so the game needs no
// audio files and stays offline. The context starts on the first user
// gesture, as browsers require; everything is guarded so a missing audio
// device never breaks the game.
export function createSound() {
  let ctx = null;
  let muted = false;
  try {
    muted = window.localStorage.getItem('lumen.muted') === '1';
  } catch {
    muted = false;
  }

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function note(freq, at, dur, type, gain) {
    const ac = ensure();
    if (!ac || muted) return;
    try {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ac.currentTime + at);
      g.gain.linearRampToValueAtTime(gain, ac.currentTime + at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(ac.currentTime + at);
      osc.stop(ac.currentTime + at + dur + 0.05);
    } catch {
      // Sound is garnish; never let it break play.
    }
  }

  return {
    get muted() {
      return muted;
    },
    toggle() {
      muted = !muted;
      try {
        window.localStorage.setItem('lumen.muted', muted ? '1' : '0');
      } catch {
        // Storage can be off; the toggle still works for this visit.
      }
      return muted;
    },
    unlock() {
      ensure();
    },
    rotate() {
      note(520, 0, 0.07, 'square', 0.05);
    },
    lit() {
      note(880, 0, 0.12, 'sine', 0.08);
      note(1320, 0.06, 0.16, 'sine', 0.06);
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.09, 0.22, 'triangle', 0.09));
    },
    lose() {
      [392, 330, 262].forEach((f, i) => note(f, i * 0.11, 0.2, 'sawtooth', 0.05));
    },
    click() {
      note(660, 0, 0.05, 'sine', 0.05);
    },
  };
}
