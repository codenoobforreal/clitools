import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVideoInfo } from "../../utils/test-utils";
import { buildFFmpegEncodeVideoArgs } from "./args";

describe("buildFFmpegEncodeVideoArgs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("should build command with basic configuration", () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00"));
    const config = createVideoInfo();
    const resultString = buildFFmpegEncodeVideoArgs(config).join(" ");

    expect(resultString).toMatch(
      /-hide_banner -loglevel error -progress pipe:2/,
    );
    expect(resultString).toMatch(/-i input.mp4/);
    expect(resultString).toMatch(/-c:v libx265/);
    expect(resultString).toMatch(
      /-x265-params log-level=error:profile=main:input-depth=8/,
    );
    expect(resultString).toMatch(/-crf 20/);
    expect(resultString).toMatch(/-f mp4/);
    expect(resultString).toMatch(/-c:a copy/);
    expect(resultString).toMatch(/input-20000101000000.mp4/);
  });

  it("should respect pix_fmt", () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00"));
    let config = createVideoInfo({
      metadata: {
        pix_fmt: "yuv420p10le",
      },
    });
    expect(buildFFmpegEncodeVideoArgs(config).join(" ")).toMatch(
      /profile=main10/,
    );

    config = createVideoInfo({
      metadata: {
        pix_fmt: "yuv422p10le",
      },
    });
    expect(buildFFmpegEncodeVideoArgs(config).join(" ")).toMatch(
      /profile=main422-10/,
    );

    config = createVideoInfo({
      metadata: {
        pix_fmt: "yuv444p10le",
      },
    });
    expect(buildFFmpegEncodeVideoArgs(config).join(" ")).toMatch(
      /profile=main444-10/,
    );
  });
});
