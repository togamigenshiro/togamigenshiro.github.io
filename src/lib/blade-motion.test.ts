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