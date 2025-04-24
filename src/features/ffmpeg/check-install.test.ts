import { platform } from "node:process";
import { afterEach, describe, expect, test, vi } from "vitest";
import which from "which";
import { checkFFmpegInstallation } from "./check-install";

describe("checkFFmpegInstallation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should not throw when both ffmpeg and ffprobe are installed", () => {
    vi.spyOn(which, "sync")
      .mockReturnValueOnce("/usr/bin/ffmpeg")
      .mockReturnValueOnce("/usr/bin/ffprobe");

    expect(checkFFmpegInstallation).not.toThrow();
  });

  test("should throw missing ffmpeg error", () => {
    vi.spyOn(which, "sync")
      .mockImplementationOnce(() => {
        throw new Error("not found");
      })
      .mockReturnValueOnce("/usr/bin/ffprobe");

    expect(checkFFmpegInstallation).toThrowErrorMatchingInlineSnapshot(`
      [Error: Missing required tools: ffmpeg.
      Installation recommendation:
      brew install ffmpeg or Download from https://ffmpeg.org/
      Note: ffprobe is typically included in ffmpeg packages. Ensure your package manager installs both tools.]
    `);
  });

  test("should throw missing ffprobe error", () => {
    vi.spyOn(which, "sync")
      .mockReturnValueOnce("/usr/bin/ffmpeg")
      .mockImplementationOnce(() => {
        throw new Error("not found");
      });

    expect(checkFFmpegInstallation).toThrowErrorMatchingInlineSnapshot(`
      [Error: Missing required tools: ffprobe.
      Installation recommendation:
      brew install ffmpeg or Download from https://ffmpeg.org/
      Note: ffprobe is typically included in ffmpeg packages. Ensure your package manager installs both tools.]
    `);
  });

  test.skipIf(platform !== "darwin")(
    "should show brew instructions on darwin",
    () => {
      vi.spyOn(which, "sync").mockImplementation(() => {
        throw new Error("not found");
      });

      expect(checkFFmpegInstallation).toThrowErrorMatchingInlineSnapshot(`
      [Error: Missing required tools: ffmpeg, ffprobe.
      Installation recommendation:
      brew install ffmpeg or Download from https://ffmpeg.org/
      Note: ffprobe is typically included in ffmpeg packages. Ensure your package manager installs both tools.]
    `);
    },
  );

  test.skipIf(platform !== "linux")(
    "should show apt instructions on linux",
    () => {
      vi.spyOn(which, "sync").mockImplementation(() => {
        throw new Error("not found");
      });

      expect(checkFFmpegInstallation).toThrowErrorMatchingInlineSnapshot();
    },
  );

  test.skipIf(platform !== "win32")(
    "should show choco instructions on win32",
    () => {
      vi.spyOn(which, "sync").mockImplementation(() => {
        throw new Error("not found");
      });

      expect(checkFFmpegInstallation).toThrowErrorMatchingInlineSnapshot();
    },
  );
});
