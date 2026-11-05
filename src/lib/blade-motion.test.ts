import { expect, it } from "vitest";
import { bladeTravel, flourish, DRAW_DURATION, SHEATHE_DURATION } from "./blade-motion";

it("draws fast with a release hesitation and an overshoot settle", () => {
  expect(bladeTravel(0, true)).toBe(0);
  expect(bladeTravel(0.2, true)).toBeLessThanOrEqual(0.03);
  expect(bladeTravel(2.0, true)).toBeCloseTo(1.035);
  expect(bladeTravel(DRAW_DURATION, true)).toBe(1);
});

it("sheathes with a lift, a fast insert, a mouth pause and a snap seat", () => {
  expect(bladeTravel(0, false)).toBe(1);
  expect(bladeTravel(0.3, false)).toBeCloseTo(1.02);
  expect(bladeTravel(2.3, false)).toBeCloseTo(0.02);
  expect(bladeTravel(SHEATHE_DURATION, false)).toBe(0);
});

it("flourishes the blade arc during the draw and lifts it for a sheathe", () => {
  expect(flourish(0, true)).toBe(0);
  expect(flourish(1.5, true)).toBe(1);
  expect(flourish(DRAW_DURATION, true)).toBe(0);
  expect(flourish(0, false)).toBe(1);
  expect(flourish(1.2, false)).toBe(0);
});

it("eases out of holds and into stops without an acceleration jump", () => {
  const step = 0.0004;
  for (const [time, drawing] of [[0.35, true], [2.0, true], [0.3, false], [2.2, false], [2.45, false]] as const) {
    const before = bladeTravel(time - step, drawing);
    const at = bladeTravel(time, drawing);
    const after = bladeTravel(time + step, drawing);
    expect(Math.abs(after - before) / (2 * step)).toBeLessThan(0.001);
    expect(Math.abs(after - 2 * at + before) / (step * step)).toBeLessThan(0.05);
  }
});
