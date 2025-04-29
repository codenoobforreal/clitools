import os from "node:os";
import process from "node:process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NothingToProcessError } from "../../error";
import { resolveAndNormalizePath } from "../../utils/path";
import { sanitizePathLikeInput } from "../../utils/sanitize";
import {
  createFFprobeResultConvertdResult,
  createVideoInfo,
} from "../../utils/test-utils";
import { getVideoPathsFromPath } from "./collector";
import { getVideoMetadata } from "./metadata";
import { filterHev1Video, getVideoInfoListFromUserInput } from "./pipeline";

vi.mock(import("./collector"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getVideoPathsFromPath: vi.fn(),
  };
});

vi.mock("../../utils/sanitize", () => ({
  sanitizePathLikeInput: vi.fn(),
}));

vi.mock(import("../../utils/path"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    resolveAndNormalizePath: vi.fn(),
  };
});

vi.mock("./metadata", () => ({
  getVideoMetadata: vi.fn(),
}));

describe("getVideoInfoListFromUserInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(os, "availableParallelism").mockReturnValue(4);
    vi.mocked(sanitizePathLikeInput).mockImplementation((input) => input);
    vi.mocked(resolveAndNormalizePath).mockReturnValue("/normalized/path");
    vi.mocked(getVideoPathsFromPath).mockResolvedValue([
      "/normalized/path/video1.mp4",
      "/normalized/path/video2.mp4",
    ]);
    vi.mocked(getVideoMetadata).mockResolvedValue(mockMetadata);
  });

  const mockMetadata = createFFprobeResultConvertdResult();

  it("should process valid directory input and return video infos", async () => {
    const results = await getVideoInfoListFromUserInput("/valid/directory");
    expect(sanitizePathLikeInput).toBeCalledWith("/valid/directory");
    expect(resolveAndNormalizePath).toBeCalledWith(
      "/valid/directory",
      process.cwd(),
    );
    expect(getVideoPathsFromPath).toBeCalledWith("/normalized/path");
    expect(results).toHaveLength(2);
    expect(results[0].input).toBe("/normalized/path/video1.mp4");
    expect(getVideoMetadata).toHaveBeenCalledTimes(2);
  });

  it("should process valid file input and return video infos", async () => {
    vi.mocked(getVideoPathsFromPath).mockResolvedValue([
      "/normalized/path/single.mp4",
    ]);
    const result = await getVideoInfoListFromUserInput("/valid/file.mp4");
    expect(getVideoPathsFromPath).toBeCalledWith("/normalized/path");
    expect(result).toHaveLength(1);
    expect(result[0].input).toBe("/normalized/path/single.mp4");
    expect(getVideoMetadata).toHaveBeenCalledTimes(1);
  });

  it("should throw error when no videos found", async () => {
    vi.mocked(getVideoPathsFromPath).mockResolvedValue([]);
    await expect(
      getVideoInfoListFromUserInput("/empty/directory"),
    ).rejects.toThrow(NothingToProcessError);
  });

  it("should return successful results with error logging", async () => {
    vi.mocked(getVideoMetadata)
      .mockResolvedValueOnce(mockMetadata)
      .mockRejectedValueOnce(new Error("Corrupted file"));
    const results = await getVideoInfoListFromUserInput("/valid/directory");
    expect(results).toHaveLength(1);
  });

  it("should enhance error messages with video path", async () => {
    const testError = new Error("Test error");
    vi.mocked(getVideoMetadata).mockRejectedValue(testError);
    vi.mocked(getVideoPathsFromPath).mockResolvedValue([
      "/normalized/path/error.mp4",
    ]);
    await expect(
      getVideoInfoListFromUserInput("/valid/directory"),
    ).rejects.toThrow(NothingToProcessError);
  });
});

describe("filterHev1Video", () => {
  it("should return videos with hevc codec and hev1 tag", () => {
    const videos = [
      createVideoInfo({
        metadata: {
          codec_name: "hevc",
          codec_tag_string: "hev1",
        },
      }),
      createVideoInfo({
        metadata: {
          codec_name: "hevc",
          codec_tag_string: "hvc1",
        },
      }),
      createVideoInfo({
        metadata: {
          codec_name: "avc1",
          codec_tag_string: "hev1",
        },
      }),
      createVideoInfo({
        metadata: {
          codec_name: "avc1",
          codec_tag_string: "avc1",
        },
      }),
      // createVideoInfo("hevc", "hev1"),
      // createVideoInfo("hevc", "hvc1"),
      // createVideoInfo("avc1", "hev1"),
      // createVideoInfo("avc1", "avc1"),
    ];
    const result = filterHev1Video(videos);
    expect(result).toMatchObject([videos[0]]);
  });

  it("should return empty array when no videos match criteria", () => {
    const videos = [
      createVideoInfo({
        metadata: {
          codec_name: "avc1",
          codec_tag_string: "hvc1",
        },
      }),
      createVideoInfo({
        metadata: {
          codec_name: "vp9",
          codec_tag_string: "hev1",
        },
      }),
      // createVideoInfo("avc1", "hvc1"),
      // createVideoInfo("vp9", "hev1"),
    ];
    expect(filterHev1Video(videos)).toEqual([]);
  });

  it("should handle empty input array", () => {
    expect(filterHev1Video([])).toEqual([]);
  });

  it("should strictly check both codec and tag", () => {
    const partialMatch1 = createVideoInfo({
      metadata: {
        codec_name: "hevc",
        codec_tag_string: "hvc1",
      },
    });
    const partialMatch2 = createVideoInfo({
      metadata: {
        codec_name: "avc1",
        codec_tag_string: "hev1",
      },
    });
    const result = filterHev1Video([partialMatch1, partialMatch2]);
    expect(result).toEqual([]);
  });
});
