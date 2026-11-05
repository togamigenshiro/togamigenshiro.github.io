export const DRAW_DURATION = 2.4;
export const SHEATHE_DURATION = 2.6;

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

/**
 * Iaidō-style snap: a short release hesitation, an explosive draw that overshoots
 * the stop and settles back; sheathing lifts, drives in fast, pauses at the mouth,
 * then snaps the final seat.
 */
export function bladeTravel(time: number, drawing: boolean) {
  const stops: [number, number][] = drawing
    ? [[0, 0], [0.35, 0.03], [2.0, 1.035], [DRAW_DURATION, 1]]
    : [[0, 1], [0.3, 1.02], [2.2, 0.02], [2.45, 0.02], [SHEATHE_DURATION, 0]];
  return piecewise(stops, time, drawing ? 1 : 0);
}

/** Arc flourish: the blade tilts up while clearing the saya; the reverse lift opens a sheathe. */
export function flourish(time: number, drawing: boolean) {
  const stops: [number, number][] = drawing
    ? [[0, 0], [0.35, 0], [1.5, 1], [2.0, 1], [DRAW_DURATION, 0]]
    : [[0, 1], [0.9, 0], [SHEATHE_DURATION, 0]];
  return piecewise(stops, time, 0);
}
