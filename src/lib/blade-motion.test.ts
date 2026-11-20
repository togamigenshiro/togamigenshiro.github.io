import { expect, it } from "vitest";
import { weaponPose, DRAW_DURATION, SHEATHE_DURATION, SWAP } from "./blade-motion";

it("finishes unsheathing in 1.1 seconds", () => {
  expect(DRAW_DURATION).toBe(1.1);
  expect(weaponPose(0, true).drawn).toBe(false);
  expect(weaponPose(DRAW_DURATION, true)).toEqual({ drawn: true, scale: 1, offset: 0 });
});

it("finishes sheathing in 1.2 seconds", () => {
  expect(SHEATHE_DURATION).toBe(1.2);
  expect(weaponPose(0, false).drawn).toBe(true);
  expect(weaponPose(SHEATHE_DURATION, false)).toEqual({ drawn: false, scale: 1, offset: 0 });
});

it("selects exactly one complete weapon at full size throughout both switches", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    for (let i = 0; i <= 100; i++) {
      const pose = weaponPose(duration * i / 100, drawing);
      expect(pose.drawn).toBe(i >= SWAP * 100 ? drawing : !drawing);
      expect(pose.scale).toBe(1);
    }
  }
});

it("swaps only while both weapons are off-screen on opposite sides", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    const before = weaponPose(duration * SWAP - 1e-6, drawing).offset;
    const after = weaponPose(duration * SWAP, drawing).offset;
    expect(Math.abs(before)).toBeGreaterThan(6);
    expect(Math.abs(after)).toBeGreaterThan(6);
    expect(Math.sign(before)).toBe(-Math.sign(after));
  }
});

it("slides in one straight direction: toward the handle when drawing, toward the tip when sheathing", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    const dir = drawing ? -1 : 1;
    for (let i = 1; i <= 200; i++) {
      const a = weaponPose(duration * (i - 1) / 200, drawing);
      const b = weaponPose(duration * i / 200, drawing);
      if (a.drawn !== b.drawn) continue; // off-screen swap
      expect(dir * (b.offset - a.offset)).toBeGreaterThanOrEqual(0);
    }
  }
});
