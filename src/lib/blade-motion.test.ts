import { expect, it } from "vitest";
import { weaponPose, DRAW_DURATION, SHEATHE_DURATION } from "./blade-motion";

it("finishes unsheathing in 0.65 seconds", () => {
  expect(DRAW_DURATION).toBe(0.65);
  expect(weaponPose(0, true).drawn).toBe(false);
  expect(weaponPose(DRAW_DURATION, true)).toEqual({ drawn: true, scale: 1, offset: 0 });
});

it("finishes sheathing in 0.7 seconds", () => {
  expect(SHEATHE_DURATION).toBe(0.7);
  expect(weaponPose(0, false).drawn).toBe(true);
  expect(weaponPose(SHEATHE_DURATION, false)).toEqual({ drawn: false, scale: 1, offset: 0 });
});

it("selects exactly one complete weapon throughout both switches", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    for (let i = 0; i <= 100; i++) {
      const pose = weaponPose(duration * i / 100, drawing);
      expect(pose.drawn).toBe(i >= 50 ? drawing : !drawing);
      expect(Number(pose.drawn) + Number(!pose.drawn)).toBe(1);
      expect(pose.scale).toBeGreaterThanOrEqual(0.079);
    }
  }
});
