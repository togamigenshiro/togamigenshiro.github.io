export const DRAW_DURATION = 4.8;
export const SHEATHE_DURATION = 5.2;

// Zero velocity AND acceleration at each boundary avoids a jerk leaving a hold.
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** Release the habaki, hold, extract along the saya, then settle. Reverse with a slow final seat. */
export function bladeTravel(time: number, drawing: boolean) {
  const stops: [number, number][] = drawing
    ? [[0, 0], [0.5, 0.035], [1.05, 0.035], [3.95, 1], [DRAW_DURATION, 1]]
    : [[0, 1], [0.7, 1], [4.25, 0.035], [4.7, 0.035], [SHEATHE_DURATION, 0]];
  for (let i = 1; i < stops.length; i++) {
    const start = stops[i - 1];
    const end = stops[i];
    if (!start || !end) continue;
    if (time <= end[0]) {
      const p = Math.max(0, Math.min(1, (time - start[0]) / (end[0] - start[0])));
      return start[1] + (end[1] - start[1]) * smooth(p);
    }
  }
  return drawing ? 1 : 0;
}