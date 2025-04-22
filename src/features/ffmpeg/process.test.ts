import { describe, expect, test } from "vitest";
import { parseProgressLine } from "./process";

describe("parseProgressLine", () => {
  test("should parse valid progress lines", () => {
    expect(parseProgressLine("frame=100")).toEqual({ frames: 100 });
    expect(parseProgressLine("fps=29.97")).toEqual({ fps: 29.97 });
    expect(parseProgressLine("speed=1.5x")).toEqual({ speed: 1.5 });
  });

  test("should ignore invalid lines", () => {
    expect(parseProgressLine("invalid_line")).toBeNull();
    expect(parseProgressLine("bitrate=N/A")).toBeNull();
  });

  test("should handle malformed values", () => {
    expect(parseProgressLine("frame=invalid")).toEqual({
      frames: NaN,
    });
    expect(parseProgressLine("speed=abcx")).toEqual({
      speed: NaN,
    });
  });
});
