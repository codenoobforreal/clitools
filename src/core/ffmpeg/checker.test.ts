import { afterEach, describe, expect, it, vi } from "vitest";
import which from "which";
import { checkFFmpegInstallation } from "./checker";

describe("checkFFmpegInstallation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not throw when both ffmpeg and ffprobe are installed", () => {
    vi.spyOn(which, "sync")
      .mockReturnValueOnce("/usr/bin/ffmpeg")
      .mockReturnValueOnce("/usr/bin/ffprobe");

    expect(checkFFmpegInstallation).not.toThrow();
  });

  it("should throw missing ffmpeg error", () => {
    vi.spyOn(which, "sync")
      .mockImplementationOnce(() => {
        throw new Error("not found");
      })
      .mockReturnValueOnce("/usr/bin/ffprobe");

    expect(checkFFmpegInstallation).toThrowError(
      /Missing required tools: ffmpeg/,
    );
  });

  it("should throw missing ffprobe error", () => {
    vi.spyOn(which, "sync")
      .mockReturnValueOnce("/usr/bin/ffmpeg")
      .mockImplementationOnce(() => {
        throw new Error("not found");
      });

    expect(checkFFmpegInstallation).toThrowError(
      /Missing required tools: ffprobe/,
    );
  });

  it("should throw both error", () => {
    vi.spyOn(which, "sync").mockImplementation(() => {
      throw new Error("not found");
    });

    expect(checkFFmpegInstallation).toThrowError(
      /Missing required tools: ffmpeg, ffprobe/,
    );
  });
});
