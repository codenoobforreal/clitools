import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { VideoInfo } from "../../types";
import {
  buildFFmpegEncodeVideoArgs,
  buildFFprobeMetadataArgs,
  buildHEVCEnableQuickTimeArgs,
  parseProgressLine,
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
    const config: VideoInfo = {
      input: "input.mp4",
      metadata: {
        width: 1920,
        height: 1080,
        avg_frame_rate: 25,
        duration: 100,
        bit_rate: 5,
        codec_name: "hevc",
        codec_tag_string: "hev1",
      },
    };
    const result = buildFFmpegEncodeVideoArgs(config);
    expect(result.join(" ")).toMatchInlineSnapshot(
      `"-hide_banner -loglevel error -progress pipe:2 -i input.mp4 -c:v libx265 -x265-params log-level=error -crf 20 -preset veryfast -f mp4 -c:a copy input-20000101000000.mp4"`,
    );
  });
});

describe("buildHEVCEnableQuickTimeArgs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("should build command with basic configuration", () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00"));
    const config: VideoInfo = {
      input: "input.mp4",
      metadata: {
        width: 1920,
        height: 1080,
        avg_frame_rate: 25,
        duration: 100,
        bit_rate: 5,
        codec_name: "hevc",
        codec_tag_string: "hev1",
      },
    };
    const result = buildHEVCEnableQuickTimeArgs(config);
    expect(result.join(" ")).toMatchInlineSnapshot(
      `"-hide_banner -loglevel error -i input.mp4 -c:v copy -f mp4 -tag:v hvc1 -c:a copy input-20000101000000.mp4"`,
    );
  });
});

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
