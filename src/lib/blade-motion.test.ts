import { expect, it } from "vitest";
import { weaponPose, DRAW_DURATION, SHEATHE_DURATION, SWAP } from "./blade-motion";

const rest = (drawn: boolean) => ({ drawn, scale: 1, offset: 0, lift: 0, tilt: 0, jolt: 0 });

it("finishes unsheathing in 1.2 seconds", () => {
  expect(DRAW_DURATION).toBe(1.2);
  expect(weaponPose(0, true).drawn).toBe(false);
  expect(weaponPose(DRAW_DURATION, true)).toEqual(rest(true));
});

it("finishes sheathing in 1.3 seconds", () => {
  expect(SHEATHE_DURATION).toBe(1.3);
  expect(weaponPose(0, false).drawn).toBe(true);
  expect(weaponPose(SHEATHE_DURATION, false)).toEqual(rest(false));
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

it("starts and settles smoothly without sudden jumps", () => {
  for (const drawing of [true, false]) {
    const duration = drawing ? DRAW_DURATION : SHEATHE_DURATION;
    const step = duration / 200;
    expect(Math.abs(weaponPose(step, drawing).offset)).toBeLessThan(0.01);
    expect(Math.abs(weaponPose(duration - step, drawing).offset)).toBeLessThan(0.001);
    for (let i = 1; i < 200; i++) {
      if (Math.abs(i / 200 - SWAP) < 0.01) continue;
      const a = weaponPose(step * (i - 1), drawing), b = weaponPose(step * i, drawing);
      expect(Math.abs(b.offset - a.offset)).toBeLessThan(0.3);
    }
  }
});
