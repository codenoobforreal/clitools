import os from "node:os";
import process from "node:process";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { resolveAndNormalizePath } from "../../utils/path";
import { sanitizePathLikeInput } from "../../utils/sanitize";
import { getImagePathsFromPath } from "./collector";
import { getImageListFromUserInput } from "./pipeline";

vi.mock(import("./collector"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getImagePathsFromPath: vi.fn(),
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

describe("getImageListFromUserInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(os, "availableParallelism").mockReturnValue(4);
    vi.mocked(sanitizePathLikeInput).mockImplementation((input) => input);
    vi.mocked(resolveAndNormalizePath).mockReturnValue("/normalized/path");
    vi.mocked(getImagePathsFromPath).mockResolvedValue([
      "/normalized/path/image1.jpg",
      "/normalized/path/image2.png",
    ]);
  });

  test("should process valid directory input and return image infos", async () => {
    const results = await getImageListFromUserInput("/valid/directory");
    expect(sanitizePathLikeInput).toBeCalledWith("/valid/directory");
    expect(resolveAndNormalizePath).toBeCalledWith(
      "/valid/directory",
      process.cwd(),
    );
    expect(getImagePathsFromPath).toBeCalledWith("/normalized/path");
    expect(results).toHaveLength(2);
    expect(results[0]).toBe("/normalized/path/image1.jpg");
  });

  test("should process valid file input and return image infos", async () => {
    vi.mocked(getImagePathsFromPath).mockResolvedValue([
      "/normalized/path/single.gif",
    ]);
    const result = await getImageListFromUserInput("/valid/image.png");
    expect(getImagePathsFromPath).toBeCalledWith("/normalized/path");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("/normalized/path/single.gif");
  });

  test("should throw error when no images found", async () => {
    vi.mocked(getImagePathsFromPath).mockResolvedValue([]);
    await expect(getImageListFromUserInput("/empty/directory")).rejects.toThrow(
      "no image to process",
    );
  });
});
