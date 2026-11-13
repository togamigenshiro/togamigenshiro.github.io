export const DRAW_DURATION = 0.65;
export const SHEATHE_DURATION = 0.7;

const SWAP = 0.4;
const WINDUP = 0.12;
const PEAK = 0.85;

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
// Small overshoot so the returning weapon lands with weight instead of gliding to a stop.
const backOut = (t: number) => { const c = 1.25; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };

/**
 * Wind-up, whip sideways at full size, swap at maximum displacement,
 * then the other weapon twirls back along its length and lands with a small overshoot.
 */
export function weaponPose(time: number, drawing: boolean) {
  const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
  const p = Math.max(0, Math.min(1, time / duration));
  const dir = drawing ? -1 : 1;
  const incoming = p >= SWAP;
  if (p >= 1) return { drawn: drawing, scale: 1, offset: 0, tilt: 0, spin: 0 };
  let offset: number;
  let tilt: number;
  let spin = 0;
  if (p < WINDUP) {
    const t = easeOut(p / WINDUP);
    offset = -dir * 0.14 * t;
    tilt = -dir * 0.08 * t;
  } else if (!incoming) {
    const t = easeIn((p - WINDUP) / (SWAP - WINDUP));
    offset = -dir * 0.14 + (dir * PEAK + dir * 0.14) * t;
    tilt = -dir * 0.08 + dir * 0.4 * t;
  } else {
    const t = (p - SWAP) / (1 - SWAP);
    offset = dir * PEAK * (1 - backOut(t));
    tilt = dir * 0.32 * (1 - easeOut(Math.min(1, t * 1.4)));
    spin = dir * Math.PI * 2 * easeOut(Math.min(1, t / 0.75));
  }
  return { drawn: incoming ? drawing : !drawing, scale: 1, offset, tilt, spin };
}
