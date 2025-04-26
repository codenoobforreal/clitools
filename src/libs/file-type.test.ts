import { fileTypeFromFile } from "file-type";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { isImageFile, isVideoFile } from "./file-type";

vi.mock(import("file-type"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fileTypeFromFile: vi.fn(),
  };
});

describe("File Type Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("isVideoFile should validate video mime types", async () => {
    vi.mocked(fileTypeFromFile).mockResolvedValue({
      mime: "video/mp4",
      ext: "mp4",
    });
    await expect(isVideoFile("video.mp4")).resolves.toBe(true);
  });

  test("isVideoFile should reject non-video files", async () => {
    vi.mocked(fileTypeFromFile).mockResolvedValue({
      mime: "image/png",
      ext: "png",
    });
    await expect(isVideoFile("image.png")).resolves.toBe(false);
  });

  test("isVideoFile should handle unrecognized file types", async () => {
    vi.mocked(fileTypeFromFile).mockResolvedValue(undefined);
    await expect(isVideoFile("unknown.bin")).resolves.toBe(false);
  });

  test("isImageFile should validate image mime types", async () => {
    vi.mocked(fileTypeFromFile).mockResolvedValue({
      mime: "image/jpeg",
      ext: "jpg",
    });
    await expect(isImageFile("photo.jpg")).resolves.toBe(true);
  });

  test("isImageFile should reject non-image files", async () => {
    vi.mocked(fileTypeFromFile).mockResolvedValue({
      mime: "application/pdf",
      ext: "pdf",
    });
    await expect(isImageFile("doc.pdf")).resolves.toBe(false);
  });
});
