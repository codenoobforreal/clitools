import { beforeEach, describe, expect, it, vi } from "vitest";
import { isPathDirectory } from "../libs/file-type";
import { collectFilesFromDirectory } from "./file-collector";
import { createFileValidator, getFilePathsFromPath } from "./path-scaner";

vi.mock("../libs/file-type", () => ({
  isPathDirectory: vi.fn(),
}));
vi.mock("./file-collector", () => ({
  collectFilesFromDirectory: vi.fn(),
}));

describe("getFilePathsFromPath", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it("Should return single file path", async () => {
    vi.mocked(isPathDirectory).mockResolvedValue(false);
    const result = await getFilePathsFromPath("/test.txt", {
      extensions: ["txt"],
      validateFn: () => Promise.resolve(true),
    });
    expect(result).toEqual(["/test.txt"]);
    expect(collectFilesFromDirectory).not.toHaveBeenCalled();
  });

  it("Directory processing with multiple extensions", async () => {
    vi.mocked(isPathDirectory).mockResolvedValue(true);
    vi.mocked(collectFilesFromDirectory).mockResolvedValue([
      "/dir/file1.JS",
      "/dir/file2.ts",
    ]);
    const result = await getFilePathsFromPath("/dir", {
      extensions: ["js", "ts"],
      validateFn: (path) =>
        Promise.resolve(path.endsWith(".JS") || path.endsWith(".ts")),
    });
    expect(result).toEqual(["/dir/file1.JS", "/dir/file2.ts"]);
    expect(collectFilesFromDirectory).toHaveBeenCalledWith(
      "/dir",
      expect.objectContaining({
        pattern: "**/*.{js,JS,ts,TS}",
      }),
    );
  });
});

describe("createFileValidator", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });
  it("Validation wrapper functionality", async () => {
    const mockValidate = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(new Error("Validation failed"));
    const validator = createFileValidator(mockValidate);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await expect(validator("/valid.txt")).resolves.toBe("/valid.txt");
    await expect(validator("/invalid.txt")).resolves.toBe("");
    await expect(validator("/error.txt")).resolves.toBe("");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to validate file: /error.txt",
      expect.any(Error),
    );
  });
});
