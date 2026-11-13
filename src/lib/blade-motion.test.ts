import { expect, it } from "vitest";
import { weaponPose, DRAW_DURATION, SHEATHE_DURATION } from "./blade-motion";

const rest = (drawn: boolean) => ({ drawn, scale: 1, offset: 0, tilt: 0, spin: 0 });

it("finishes unsheathing in 0.65 seconds", () => {
  expect(DRAW_DURATION).toBe(0.65);
  expect(weaponPose(0, true).drawn).toBe(false);
  expect(weaponPose(DRAW_DURATION, true)).toEqual(rest(true));
});

it("finishes sheathing in 0.7 seconds", () => {
  expect(SHEATHE_DURATION).toBe(0.7);
  expect(weaponPose(0, false).drawn).toBe(true);
  expect(weaponPose(SHEATHE_DURATION, false)).toEqual(rest(false));
});

it("selects exactly one complete weapon at full size throughout both switches", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    for (let i = 0; i <= 100; i++) {
      const pose = weaponPose(duration * i / 100, drawing);
      expect(pose.drawn).toBe(i >= 40 ? drawing : !drawing);
      expect(pose.scale).toBe(1);
    }
  }
});

it("swaps at maximum sideways displacement without a position jump", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    const cut = duration * 0.4;
    expect(weaponPose(cut, drawing).offset).toBeCloseTo(drawing ? -0.85 : 0.85);
    expect(weaponPose(cut - 0.00001, drawing).offset).toBeCloseTo(weaponPose(cut + 0.00001, drawing).offset, 3);
  }
});

it("returns with one full twirl along the blade", () => {
  expect(Math.abs(weaponPose(DRAW_DURATION * 0.99, true).spin)).toBeCloseTo(Math.PI * 2, 5);
  expect(weaponPose(DRAW_DURATION * 0.3, true).spin).toBe(0);
});
