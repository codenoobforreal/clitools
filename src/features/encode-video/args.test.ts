import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoInfo } from "../../types";
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
