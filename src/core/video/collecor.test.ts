import { glob, Path } from "glob";
import { beforeEach } from "node:test";
import { describe, expect, test, vi } from "vitest";
import { SUPPORT_VIDEO_EXT } from "../../constants";
import { isPathDirectory, isVideoFile } from "../../libs/file-type";
import { getVideoPathsFromPath } from "./collector";

vi.mock("glob");

vi.mock("../../libs/file-type", () => ({
  isPathDirectory: vi.fn(),
  isVideoFile: vi.fn(),
}));

describe("collectVideoFilesFromPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should handle video path", async () => {
    vi.mocked(isPathDirectory).mockResolvedValue(false);
    const dir = "./test.mp4";
    const files = await getVideoPathsFromPath(dir);
    expect(files).toEqual([dir]);
  });

  test("should correctly return a list of video files", async () => {
    const mockFiles = [
      {
        isSymbolicLink: () => false,
        fullpath: () => "test1.mp4",
      },
      {
        isSymbolicLink: () => false,
        fullpath: () => "test2.jpg",
      },
      {
        isSymbolicLink: () => false,
        fullpath: () => "test3.mkv",
      },
    ];
    vi.mocked(isPathDirectory).mockResolvedValue(true);
    vi.mocked(glob).mockResolvedValue(mockFiles as Path[]);
    vi.mocked(isVideoFile).mockImplementation(async (filepath) => {
      return filepath.endsWith(".mp4") || filepath.endsWith(".mkv");
    });
    const dir = "./testDir";
    const files = await getVideoPathsFromPath(dir);
    expect(files).toEqual(["test1.mp4", "test3.mkv"]);
    const extensions = SUPPORT_VIDEO_EXT.flatMap((ext) => [
      ext,
      ext.toUpperCase(),
    ]);
    expect(glob).toHaveBeenCalledWith(`**/*.{${extensions.join(",")}}`, {
      nodir: true,
      cwd: dir,
      withFileTypes: true,
      dot: false,
      follow: false,
      nocase: true,
      stat: true,
    });
  });

  test("should return an empty array if no video files are found", async () => {
    const mockFiles = [
      {
        isSymbolicLink: () => true,
        fullpath: () => "test1.mp4",
      },
    ];
    vi.mocked(isPathDirectory).mockResolvedValue(true);
    vi.mocked(glob).mockResolvedValue(mockFiles as Path[]);
    vi.mocked(isVideoFile).mockImplementation(async (filepath) => {
      return filepath.endsWith(".mp4") || filepath.endsWith(".mkv");
    });
    const dir = "./testDir";
    const result = await getVideoPathsFromPath(dir);
    expect(result).toEqual([]);
  });

  test("should return an empty array if only file is symbolink", async () => {
    const mockFiles = [
      {
        isSymbolicLink: () => false,
        fullpath: () => "test1.txt",
      },
    ];
    vi.mocked(isPathDirectory).mockResolvedValue(true);
    vi.mocked(glob).mockResolvedValue(mockFiles as Path[]);
    vi.mocked(isVideoFile).mockResolvedValue(false);
    const dir = "./testDir";
    const result = await getVideoPathsFromPath(dir);
    expect(result).toEqual([]);
  });

  test("should handle an empty directory", async () => {
    const mockFiles: Path[] = [];
    vi.mocked(isPathDirectory).mockResolvedValue(true);
    vi.mocked(glob).mockResolvedValue(mockFiles);
    const dir = "./emptyDir";
    const result = await getVideoPathsFromPath(dir);
    expect(result).toEqual([]);
  });
});
