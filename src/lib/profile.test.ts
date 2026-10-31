import { describe, expect, it } from "vitest";
import { togamiProfile } from "./profile";

describe("Togami's profile", () => {
  it("is Japanese", () => expect(togamiProfile.nationality).toBe("Japanese"));
  it("is 22 years old", () => expect(togamiProfile.age).toBe(22));
  it("is 6 feet 2 inches tall", () => {
    expect(togamiProfile.heightFeet).toBe(6);
    expect(togamiProfile.heightInches).toBe(2);
  });
});