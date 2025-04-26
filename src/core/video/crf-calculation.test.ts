import { describe, expect, it } from "vitest";
import { calculateCrfByPixelCount } from "./crf-calculation";

describe("calculateCrfByPixelCount", () => {
  it("should return correct CRF for 4K resolution", () => {
    expect(calculateCrfByPixelCount(3840 * 2160)).toBe(22);
  });

  it("should return correct CRF for 2K resolution", () => {
    expect(calculateCrfByPixelCount(2560 * 1440)).toBe(20);
  });

  it("should return default CRF for low resolutions", () => {
    expect(calculateCrfByPixelCount(1280 * 720 - 1)).toBe(18);
    expect(calculateCrfByPixelCount(800 * 600)).toBe(18);
  });

  it("should handle exact threshold matches", () => {
    expect(calculateCrfByPixelCount(8_294_400)).toBe(22);
    expect(calculateCrfByPixelCount(2_073_600)).toBe(20);
    expect(calculateCrfByPixelCount(921_600)).toBe(19);
  });
});
