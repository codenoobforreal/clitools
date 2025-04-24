import { beforeEach, describe, expect, test, vi } from "vitest";
import type { FFprobeResultConvertResult } from "../../types";
import {
  buildFFprobeMetadataArgs,
  runFFprobeCommand,
} from "../ffmpeg/commands";
import {
  calcFFprobeFps,
  convertFFprobeResult,
  getVideoMetadata,
} from "./metadata";

vi.mock("../ffmpeg/commands", () => ({
  buildFFprobeMetadataArgs: vi.fn(),
  runFFprobeCommand: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("convertFFprobeResult", () => {
  test("should correctly parse all expected fields", () => {
    const input = `codec_name=hevc\ncodec_tag_string=hev1\nwidth=720\nheight=480\nduration=100.5\nnb_frames=2400\navg_frame_rate=24/1\nbit_rate=1`;
    const expected: FFprobeResultConvertResult = {
      width: 720,
      height: 480,
      duration: 100.5,
      avg_frame_rate: 24,
      bit_rate: 1,
      codec_name: "hevc",
      codec_tag_string: "hev1",
    };
    const result = convertFFprobeResult(input);
    expect(result).toEqual(expected);
  });
  test("should throw error for Empty key", () => {
    const input = "=210";
    expect(() =>
      convertFFprobeResult(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Empty key in key-value pair: =210]`,
    );
  });
  test("should throw error for invalid lines", () => {
    const input = "invalid_line";
    expect(() =>
      convertFFprobeResult(input),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Missing equals sign in key-value pair: invalid_line]`,
    );
  });
});

describe("getVideoMetadata", () => {
  test("should return converted result on valid output", async () => {
    const mockOutput = [
      "width=1920",
      "height=1080",
      "avg_frame_rate=24/1",
      "duration=10.0",
      "bit_rate=5",
      "codec_name=hevc",
      "codec_tag_string=hev1",
    ].join("\n");

    vi.mocked(runFFprobeCommand).mockResolvedValue({
      out: mockOutput,
      err: "",
    });

    const result = await getVideoMetadata("valid.mp4");

    expect(result).toEqual({
      codec_name: "hevc",
      codec_tag_string: "hev1",
      width: 1920,
      height: 1080,
      avg_frame_rate: 24,
      duration: 10,
      bit_rate: 5,
    });
  });

  test("should return null when runFFprobeCommand return undefined", async () => {
    const videoPath = "./nonexistent.mp4";
    vi.mocked(runFFprobeCommand).mockResolvedValue(undefined);
    await expect(getVideoMetadata(videoPath)).resolves.toBeNull();
    expect(buildFFprobeMetadataArgs).toHaveBeenCalled();
  });

  test("should throw error when ffprobe output is empty", async () => {
    vi.mocked(runFFprobeCommand).mockImplementationOnce(async () => ({
      out: "",
      err: "ffprobe error",
    }));
    const videoPath = "./test.mp4";
    await expect(
      getVideoMetadata(videoPath),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: ffprobe error]`);
    expect(buildFFprobeMetadataArgs).toHaveBeenCalled();
  });
});

describe("calcFFprobeFps", () => {
  test("should return integer for whole numbers", () => {
    expect(calcFFprobeFps("30/1")).toBe(30);
    expect(calcFFprobeFps("24000/1000")).toBe(24);
  });

  test("should keep 2 decimals for fractional values", () => {
    expect(calcFFprobeFps("30000/1001")).toBe(29.97);
    expect(calcFFprobeFps("1/3")).toBe(0.33);
  });

  test("should trim trailing zeros", () => {
    expect(calcFFprobeFps("25000/1000")).toBe(25);
    expect(calcFFprobeFps("25500/1000")).toBe(25.5);
  });

  test("should handle edge cases", () => {
    expect(calcFFprobeFps("2997/100")).toBe(29.97);
    expect(calcFFprobeFps("14142/1000")).toBe(14.14);
  });
});
