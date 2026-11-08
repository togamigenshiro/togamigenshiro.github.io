export const DRAW_DURATION = 0.65;
export const SHEATHE_DURATION = 0.7;

// Zero velocity AND acceleration at each boundary avoids a jerk leaving a hold.
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Full-size sideways snap, then a softer return; swap at maximum displacement. */
export function weaponPose(time: number, drawing: boolean) {
  const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
  const progress = Math.max(0, Math.min(1, time / duration));
  const incoming = progress >= 0.4;
  const stroke = incoming ? 1 - smooth((progress - 0.4) / 0.6) : smooth(progress / 0.4);
  return {
    drawn: incoming ? drawing : !drawing,
    scale: 1,
    offset: stroke === 0 ? 0 : (drawing ? -0.85 : 0.85) * stroke,
  };
}
