import { glob, type Path } from "glob";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SUPPORT_VIDEO_EXT } from "../../constants";
import {
  getCurrentDateTime,
  getFileNameFromPath,
  isVideoFile,
} from "../../utils";
import {
  calculateCrfByPixelCount,
  collectSupportedVideoFilesFromDirectory,
  convertBitrateToMbps,
  getVideoOutputPath,
} from "./utils";

vi.mock("glob");
vi.mock("../../utils", async () => {
  const originalModule =
    await vi.importActual<typeof import("../../utils")>("../../utils");
  return {
    ...originalModule,
    isVideoFile: vi.fn(),
    getFileNameFromPath: vi.fn(),
    getCurrentDateTime: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("collectSupportedVideoFilesFromDirectory", () => {
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
    vi.mocked(glob).mockResolvedValue(mockFiles as Path[]);
    vi.mocked(isVideoFile).mockImplementation(async (filepath) => {
      return filepath.endsWith(".mp4") || filepath.endsWith(".mkv");
    });
    const dir = "./testDir";
    const files = await collectSupportedVideoFilesFromDirectory(dir);
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
    vi.mocked(glob).mockResolvedValue(mockFiles as Path[]);
    vi.mocked(isVideoFile).mockImplementation(async (filepath) => {
      return filepath.endsWith(".mp4") || filepath.endsWith(".mkv");
    });
    const dir = "./testDir";
    const result = await collectSupportedVideoFilesFromDirectory(dir);
    expect(result).toEqual([]);
  });

  test("should return an empty array if only file is symbolink", async () => {
    const mockFiles = [
      {
        isSymbolicLink: () => false,
        fullpath: () => "test1.txt",
      },
    ];
    vi.mocked(glob).mockResolvedValue(mockFiles as Path[]);
    vi.mocked(isVideoFile).mockResolvedValue(false);
    const dir = "./testDir";
    const result = await collectSupportedVideoFilesFromDirectory(dir);
    expect(result).toEqual([]);
  });

  test("should handle an empty directory", async () => {
    const mockFiles: Path[] = [];
    vi.mocked(glob).mockResolvedValue(mockFiles);
    const dir = "./emptyDir";
    const result = await collectSupportedVideoFilesFromDirectory(dir);
    expect(result).toEqual([]);
  });
});

describe("getVideoOutputPath", () => {
  beforeEach(() => {
    vi.mocked(getFileNameFromPath).mockReturnValue("source");
    vi.mocked(getCurrentDateTime).mockReturnValue("20231104123456");
  });

  test("should generate correct output path - standard filename", () => {
    const source = "/videos/source.mp4";
    const format = "mp4";
    const expected = "/videos/source-20231104123456.mp4";

    expect(getVideoOutputPath(source, format)).toBe(expected);
  });

  // Test case 3: Different file formats
  test("should support various format extensions", () => {
    const source = "/tmp/test.avi";
    const testCases = [
      { format: "mkv", expected: "/tmp/test-20231104123456.mkv" },
      { format: "mov", expected: "/tmp/test-20231104123456.mov" },
      { format: "webm", expected: "/tmp/test-20231104123456.webm" },
    ];
    vi.mocked(getFileNameFromPath).mockReturnValue("test");

    testCases.forEach(({ format, expected }) => {
      expect(getVideoOutputPath(source, format)).toBe(expected);
    });
  });

  test("should handle filenames with special characters", () => {
    const source = "/data/video@123/my video file.mp4";
    const expected = "/data/video@123/my video file-20231104123456.mp4";
    vi.mocked(getFileNameFromPath).mockReturnValue("my video file");

    expect(getVideoOutputPath(source, "mp4")).toBe(expected);
  });
});

describe("convertBitrateToMbps", () => {
  test("should convert bitrate to Mbps with 1 decimal precision", () => {
    expect(convertBitrateToMbps(2_500_000)).toBe(2.5);
    expect(convertBitrateToMbps(1_999_999)).toBe(2.0);
    expect(convertBitrateToMbps(1_234_567)).toBe(1.23);
  });

  test("should return integer when decimal is .0", () => {
    expect(convertBitrateToMbps(3_000_000)).toBe(3);
    expect(convertBitrateToMbps(500_000)).toBe(0.5);
  });

  test("should handle edge rounding cases", () => {
    expect(convertBitrateToMbps(1_249_999)).toBe(1.25);
    expect(convertBitrateToMbps(1_250_000)).toBe(1.25);
  });
});

describe("calculateCrfByPixelCount", () => {
  test("should return correct CRF for 4K resolution", () => {
    expect(calculateCrfByPixelCount(3840 * 2160)).toBe(22);
  });

  test("should return correct CRF for 2K resolution", () => {
    expect(calculateCrfByPixelCount(2560 * 1440)).toBe(20);
  });

  test("should return default CRF for low resolutions", () => {
    expect(calculateCrfByPixelCount(1280 * 720 - 1)).toBe(18);
    expect(calculateCrfByPixelCount(800 * 600)).toBe(18);
  });

  test("should handle exact threshold matches", () => {
    expect(calculateCrfByPixelCount(8_294_400)).toBe(22);
    expect(calculateCrfByPixelCount(2_073_600)).toBe(20);
    expect(calculateCrfByPixelCount(921_600)).toBe(19);
  });
});
