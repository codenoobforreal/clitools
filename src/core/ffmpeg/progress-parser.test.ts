import { describe, expect, it } from "vitest";
import { parseProgressLine } from "./progress-parser";

describe("parseProgressLine", () => {
  it("should parse valid progress lines", () => {
    expect(parseProgressLine("frame=100")).toEqual({ frames: 100 });
    expect(parseProgressLine("fps=29.97")).toEqual({ fps: 29.97 });
    expect(parseProgressLine("speed=1.5x")).toEqual({ speed: 1.5 });
  });

  it("should ignore invalid lines", () => {
    expect(parseProgressLine("invalid_line")).toBeNull();
    expect(parseProgressLine("bitrate=N/A")).toBeNull();
  });

  it("should handle malformed values", () => {
    expect(parseProgressLine("frame=invalid")).toEqual({
      frames: NaN,
    });
    expect(parseProgressLine("speed=abcx")).toEqual({
      speed: NaN,
    });
  });
});
