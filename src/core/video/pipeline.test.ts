import os from "node:os";
import process from "node:process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FFprobeResultConvertdResult } from "../../types";
import { resolveAndNormalizePath } from "../../utils/path";
import { sanitizePathLikeInput } from "../../utils/sanitize";
import { getVideoPathsFromPath } from "./collector";
import { getVideoMetadata } from "./metadata";
import { getVideoInfoListFromUserInput } from "./pipeline";

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

  const mockMetadata: FFprobeResultConvertdResult = {
    width: 720,
    height: 480,
    duration: 100.5,
    avg_frame_rate: 24,
    bit_rate: 1,
    codec_name: "hevc",
    codec_tag_string: "hev1",
  };

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
    ).rejects.toThrow("no video to process");
  });

  it("should return successful results with error logging", async () => {
    vi.mocked(getVideoMetadata)
      .mockResolvedValueOnce(mockMetadata)
      .mockRejectedValueOnce(new Error("Corrupted file"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const results = await getVideoInfoListFromUserInput("/valid/directory");
    expect(results).toHaveLength(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Corrupted file"),
    );
  });

  it("should enhance error messages with video path", async () => {
    const testError = new Error("Test error");
    vi.mocked(getVideoMetadata).mockRejectedValue(testError);
    vi.mocked(getVideoPathsFromPath).mockResolvedValue([
      "/normalized/path/error.mp4",
    ]);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      getVideoInfoListFromUserInput("/valid/directory"),
    ).resolves.toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Processing failed: [/normalized/path/error.mp4] Test error",
    );
  });
});
