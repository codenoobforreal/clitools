import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { VideoEncodeInfo } from "../../types";
import {
  buildFFmpegEncodeVideoArgs,
  buildFFprobeMetadataArgs,
} from "./commands";

describe("buildFFprobeMetadataArgs", () => {
  test("should return the same command arguments", () => {
    let input = "input";
    expect(buildFFprobeMetadataArgs(input).join(" ")).toMatchInlineSnapshot(
      `"-v error -select_streams v:0 -show_entries stream:format -of default=noprint_wrappers=1:nokey=0 input"`,
    );
    input = "another";
    expect(buildFFprobeMetadataArgs(input).join(" ")).toMatchInlineSnapshot(
      `"-v error -select_streams v:0 -show_entries stream:format -of default=noprint_wrappers=1:nokey=0 another"`,
    );
  });
});

describe("buildFFmpegEncodeVideoArgs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("should build command with basic configuration", () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00"));
    const config: VideoEncodeInfo = {
      input: "input.mp4",
      metadata: {
        width: 1920,
        height: 1080,
        avg_frame_rate: 25,
        duration: 100,
        bit_rate: 5,
      },
    };
    const result = buildFFmpegEncodeVideoArgs(config);
    expect(result.join(" ")).toMatchInlineSnapshot(
      `"-hide_banner -loglevel error -progress pipe:2 -i input.mp4 -c:v libx265 -x265-params log-level=error -crf 20 -preset veryfast -f mp4 -c:a copy input-20000101000000.mp4"`,
    );
  });
});
