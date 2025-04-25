import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { VideoInfo } from "../../types";
import { buildHEVCEnableQuickTimeArgs } from "./args";

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
