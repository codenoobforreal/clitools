import { beforeEach, describe, expect, test, vi } from "vitest";
import { getCurrentDateTime } from "../../utils/date";
import { getFileNameFromPath } from "../../utils/path";
import { getVideoOutputPath } from "./path-utils";

vi.mock("../../utils/date", () => ({
  getCurrentDateTime: vi.fn(),
}));

vi.mock("../../utils/path", () => ({
  getFileNameFromPath: vi.fn(),
}));

describe("getVideoOutputPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFileNameFromPath).mockReturnValue("source");
    vi.mocked(getCurrentDateTime).mockReturnValue("20231104123456");
  });

  test("should generate correct output path - standard filename", () => {
    const source = "/videos/source.mp4";
    const format = "mp4";
    const expected = "/videos/source-20231104123456.mp4";

    expect(getVideoOutputPath(source, format)).toBe(expected);
  });

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
