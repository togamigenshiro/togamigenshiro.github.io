export const DRAW_DURATION = 0.65;
export const SHEATHE_DURATION = 0.7;

// Zero velocity AND acceleration at each boundary avoids a jerk leaving a hold.
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

function piecewise(stops: [number, number][], time: number, end: number) {
  for (let i = 1; i < stops.length; i++) {
    const start = stops[i - 1];
    const stop = stops[i];
    if (!start || !stop) continue;
    if (time <= stop[0]) {
      const p = Math.max(0, Math.min(1, (time - start[0]) / (stop[0] - start[0])));
      return start[1] + (stop[1] - start[1]) * smooth(p);
    }
  }
  return end;
}

/** Swap opaque complete models at the narrowest pose, never showing both. */
export function weaponPose(time: number, drawing: boolean) {
  const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
  const progress = Math.max(0, Math.min(1, time / duration));
  const incoming = progress >= 0.5;
  return {
    drawn: incoming ? drawing : !drawing,
    scale: piecewise([[0, 1], [duration / 2, 0.08], [duration, 1]], time, 1),
    offset: incoming ? (1 - smooth((progress - 0.5) * 2)) * 0.25 : -smooth(progress * 2) * 0.25,
  };
}
