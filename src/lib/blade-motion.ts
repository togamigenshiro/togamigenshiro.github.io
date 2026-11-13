export const DRAW_DURATION = 0.65;
export const SHEATHE_DURATION = 0.7;

/** Progress where the outgoing weapon is fully off-screen and the other one takes its place. */
export const SWAP = 0.28;
/** Progress where the incoming slash stops hard. */
export const IMPACT = 0.62;
const EXIT = 6.5;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Iai slash-in: the current weapon shoots off one side, then the other weapon
 * slashes in diagonally from the opposite side, stops hard and recoils slightly.
 * `jolt` (0..1) drives a brief camera punch at the impact.
 */
export function weaponPose(time: number, drawing: boolean) {
  const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
  const p = Math.max(0, Math.min(1, time / duration));
  const dir = drawing ? 1 : -1;
  if (p >= 1) return { drawn: drawing, scale: 1, offset: 0, lift: 0, tilt: 0, jolt: 0 };
  if (p < SWAP) {
    const t = p / SWAP;
    return {
      drawn: !drawing, scale: 1,
      offset: dir * (EXIT * t ** 3 - 0.35 * Math.sin(Math.PI * t) * (1 - t)),
      lift: 0.15 * Math.sin(Math.PI * t),
      tilt: -dir * 0.25 * t * t,
      jolt: 0,
    };
  }
  if (p < IMPACT) {
    const left = 1 - easeOutExpo((p - SWAP) / (IMPACT - SWAP));
    return { drawn: drawing, scale: 1, offset: -dir * EXIT * left, lift: 1.6 * left, tilt: -dir * 0.75 * left, jolt: 0 };
  }
  const r = (p - IMPACT) / (1 - IMPACT);
  const recoil = Math.sin(r * Math.PI * 2) * Math.exp(-5 * r);
  return { drawn: drawing, scale: 1, offset: dir * 0.09 * recoil, lift: -0.03 * recoil, tilt: dir * 0.04 * recoil, jolt: Math.exp(-8 * r) };
}
