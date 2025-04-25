import { describe, expect, test } from "vitest";
import { convertBitrateToMbps } from "./bitrate-conversion";

describe("convertBitrateToMbps", () => {
  test("should convert bitrate to Mbps with 1 decimal precision", () => {
    expect(convertBitrateToMbps(2_500_000)).toBe(2.5);
    expect(convertBitrateToMbps(1_999_999)).toBe(2.0);
    expect(convertBitrateToMbps(1_234_567)).toBe(1.23);
  });

  test("should return integer when decimal is .0", () => {
    expect(convertBitrateToMbps(3_000_000)).toBe(3);
    expect(convertBitrateToMbps(500_000)).toBe(0.5);
  });

  test("should handle edge rounding cases", () => {
    expect(convertBitrateToMbps(1_249_999)).toBe(1.25);
    expect(convertBitrateToMbps(1_250_000)).toBe(1.25);
  });
});
