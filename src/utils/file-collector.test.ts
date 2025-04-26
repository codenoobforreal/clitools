import { Path } from "glob";
import os from "node:os";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { globSearchFileEntries } from "../libs/glob";
import { collectFilesFromDirectory } from "./file-collector";

vi.mock("../libs/glob", () => ({
  globSearchFileEntries: vi.fn(),
}));

describe("collectFilesFromDirectory", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(os, "availableParallelism").mockReturnValue(4);
  });

  it("should return validated file paths matching pattern", async () => {
    vi.mocked(globSearchFileEntries).mockResolvedValue([
      { isSymbolicLink: () => false, fullpath: () => "/file1.txt" },
      { isSymbolicLink: () => false, fullpath: () => "/file2.txt" },
    ] as Path[]);
    const validator = vi.fn().mockResolvedValue("valid-path");
    const results = await collectFilesFromDirectory("/test", {
      pattern: "*.txt",
      validator,
    });
    expect(results).toEqual(["valid-path", "valid-path"]);
    expect(validator).toHaveBeenCalledTimes(2);
  });

  it("should filter out symbolic links before validation", async () => {
    vi.mocked(globSearchFileEntries).mockResolvedValue([
      { isSymbolicLink: () => false, fullpath: () => "/valid.txt" },
      { isSymbolicLink: () => true, fullpath: () => "/link.txt" },
    ] as Path[]);
    const validator = vi.fn().mockResolvedValue("valid-path");
    const results = await collectFilesFromDirectory("/test", {
      pattern: "*.txt",
      validator,
    });
    expect(results).toEqual(["valid-path"]);
    expect(validator).toHaveBeenCalledWith("/valid.txt");
    expect(validator).not.toHaveBeenCalledWith("/link.txt");
  });

  it("should filter out null and rejected validations", async () => {
    vi.mocked(globSearchFileEntries).mockResolvedValue([
      { isSymbolicLink: () => false, fullpath: () => "/valid.txt" },
      { isSymbolicLink: () => false, fullpath: () => "/invalid.txt" },
    ] as Path[]);
    const validator = vi
      .fn()
      .mockResolvedValueOnce("valid-path")
      .mockResolvedValueOnce(null);
    const results = await collectFilesFromDirectory("/test", {
      pattern: "*.txt",
      validator,
    });
    expect(results).toEqual(["valid-path"]);
  });

  it("should return empty array when directory scan fails", async () => {
    vi.mocked(globSearchFileEntries).mockRejectedValue(
      new Error("Scan failed"),
    );
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
    const results = await collectFilesFromDirectory("/test", {
      pattern: "*.txt",
      validator: vi.fn(),
    });
    expect(results).toEqual([]);
    expect(consoleMock).toHaveBeenCalledWith(
      "Failed to scan directory:",
      expect.any(Error),
    );
  });
});
