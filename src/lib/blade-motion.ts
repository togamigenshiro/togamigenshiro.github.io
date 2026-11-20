export const DRAW_DURATION = 1.2;
export const SHEATHE_DURATION = 1.3;

/** Progress where the outgoing weapon is fully off-screen and the other one takes its place. */
export const SWAP = 0.4;
const EXIT = 6.5;

/**
 * Crescent glide (mikazuki): the current weapon eases away along a rising arc,
 * then the other weapon swoops in along a falling crescent from the opposite side
 * and settles with zero velocity. `jolt` (0..1) drives a soft camera breath.
 */
export function weaponPose(time: number, drawing: boolean) {
  const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
  const p = Math.max(0, Math.min(1, time / duration));
  const dir = drawing ? 1 : -1;
  if (p >= 1) return { drawn: drawing, scale: 1, offset: 0, lift: 0, tilt: 0, jolt: 0 };
  if (p < SWAP) {
    const e = (p / SWAP) ** 2;
    return {
      drawn: !drawing, scale: 1,
      offset: dir * EXIT * e,
      lift: 0.9 * Math.sin((e * Math.PI) / 2),
      tilt: dir * 0.35 * e,
      jolt: 0,
    };
  }
  const t = (p - SWAP) / (1 - SWAP);
  const left = (1 - t) ** 4;
  return {
    drawn: drawing, scale: 1,
    offset: -dir * EXIT * left,
    lift: 1.3 * Math.sqrt(left),
    tilt: -dir * 0.6 * Math.sqrt(left),
    jolt: Math.sin(Math.PI * t) ** 2,
  };
}
