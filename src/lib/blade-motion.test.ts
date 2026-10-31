import { expect, it } from "vitest";
import { bladeTravel, DRAW_DURATION, SHEATHE_DURATION } from "./blade-motion";

it("holds the released blade before full extraction", () => {
  expect(bladeTravel(0, true)).toBe(0);
  expect(bladeTravel(0.8, true)).toBe(0.035);
  expect(bladeTravel(DRAW_DURATION, true)).toBe(1);
});
it("pauses before the final sheath seat", () => {
  expect(bladeTravel(0, false)).toBe(1);
  expect(bladeTravel(4.5, false)).toBeCloseTo(0.035);
  expect(bladeTravel(SHEATHE_DURATION, false)).toBe(0);
});

it("eases out of holds and into stops without an acceleration jump", () => {
  const step = 0.001;
  for (const [time, drawing] of [[1.05, true], [3.95, true], [0.7, false], [4.25, false], [4.7, false], [5.2, false]] as const) {
    const before = bladeTravel(time - step, drawing);
    const at = bladeTravel(time, drawing);
    const after = bladeTravel(time + step, drawing);
    expect(Math.abs(after - before) / (2 * step)).toBeLessThan(0.001);
    expect(Math.abs(after - 2 * at + before) / (step * step)).toBeLessThan(0.05);
  }
});