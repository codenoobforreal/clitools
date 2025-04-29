import { platform } from "node:process";
import which from "which";
import { MissingBinariesError } from "../../error.js";

export function checkFFmpegInstallation(): void {
  const missingTools: string[] = [];

  try {
    which.sync("ffmpeg");
  } catch {
    missingTools.push("ffmpeg");
  }

  try {
    which.sync("ffprobe");
  } catch {
    missingTools.push("ffprobe");
  }

  if (missingTools.length > 0) {
    let installationCommand: string;

    switch (platform) {
      case "darwin":
        installationCommand =
          "brew install ffmpeg or Download from https://ffmpeg.org/";
        break;
      case "linux":
        installationCommand =
          "sudo apt-get install ffmpeg or Download from https://ffmpeg.org/";
        break;
      case "win32":
        installationCommand =
          "choco install ffmpeg or Download from https://ffmpeg.org/";
        break;
      default:
        installationCommand = "Download from https://ffmpeg.org/";
    }

    const errorMessage =
      `Missing required tools: ${missingTools.join(", ")}.\n` +
      `Installation recommendation:\n${installationCommand}\n` +
      "Note: ffprobe is typically included in ffmpeg packages. Ensure your package manager installs both tools.";

    throw new MissingBinariesError(errorMessage);
  }
}
