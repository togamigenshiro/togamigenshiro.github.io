export const DRAW_DURATION = 1.1;
export const SHEATHE_DURATION = 1.2;

/** Progress where the outgoing weapon is fully off-screen and the other one takes its place. */
export const SWAP = 0.5;
const EXIT = 6.5;
const NUDGE = 0.12;

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t ** 3;

/**
 * Straight slide along the blade's own axis, like a real draw.
 * Negative offset = toward the handle (drawing direction), positive = toward the tip (sheathing).
 * Thumb-push nudge, short tension hold, accelerating pull off one side; the other weapon
 * continues the same straight motion in from the opposite side and slows to rest.
 */
export function weaponPose(time: number, drawing: boolean) {
  const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
  const p = Math.max(0, Math.min(1, time / duration));
  const dir = drawing ? -1 : 1;
  if (p >= 1) return { drawn: drawing, scale: 1, offset: 0 };
  if (p < 0.14) return { drawn: !drawing, scale: 1, offset: dir * NUDGE * easeOut(p / 0.14) };
  if (p < 0.24) return { drawn: !drawing, scale: 1, offset: dir * NUDGE };
  if (p < SWAP) {
    const t = easeIn((p - 0.24) / (SWAP - 0.24));
    return { drawn: !drawing, scale: 1, offset: dir * (NUDGE + (EXIT - NUDGE) * t) };
  }
  const t = easeOut((p - SWAP) / (1 - SWAP));
  return { drawn: drawing, scale: 1, offset: -dir * EXIT * (1 - t) };
}
