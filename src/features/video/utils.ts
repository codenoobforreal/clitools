import { glob } from "glob";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import pLimit from "p-limit";
import { SUPPORT_VIDEO_EXT } from "../../constants.js";
import type { VideoInfo } from "../../types.js";
import {
  getCurrentDateTime,
  getFileNameFromPath,
  isPathDirectory,
  isVideoFile,
} from "../../utils.js";
import { getVideoMetadata } from "./metadata.js";

export async function collectVideoFilesFromPath(path: string) {
  const isDirectory = await isPathDirectory(path);
  const collectedVideoPaths: string[] = [];
  if (!isDirectory) {
    collectedVideoPaths.push(path);
  } else {
    const videosInDirectory =
      await collectSupportedVideoFilesFromDirectory(path);
    collectedVideoPaths.push(...videosInDirectory);
  }
  return collectedVideoPaths;
}

async function collectSupportedVideoFilesFromDirectory(directoryPath: string) {
  const concurrency = Math.max(1, os.availableParallelism());
  const limit = pLimit(concurrency);

  try {
    const extensions = SUPPORT_VIDEO_EXT.flatMap((ext) => [
      ext,
      ext.toUpperCase(),
    ]);
    const pattern = `**/*.{${extensions.join(",")}}`;

    const fileEntries = await glob(pattern, {
      nodir: true,
      nocase: true,
      cwd: directoryPath,
      withFileTypes: true,
      follow: false,
      dot: false,
      stat: true,
    });

    const validationTasks = fileEntries.map((filePath) => {
      const absolutePath = filePath.fullpath();
      return limit(async () => {
        try {
          if (filePath.isSymbolicLink()) {
            return null;
          }
          const isValid = await isVideoFile(absolutePath);
          return isValid ? absolutePath : null;
        } catch (error) {
          console.error(`Failed to validate file: ${absolutePath}`, error);
          return null;
        }
      });
    });

    const results = await Promise.allSettled(validationTasks);

    return results.flatMap((result) => {
      if (result.status === "fulfilled" && result.value !== null) {
        return [result.value];
      }
      return [];
    });
  } catch (error) {
    console.error("Failed to scan diretory:", error);
    return [];
  }
}

/**
 * get output path by the video input path
 * @param source video input path
 * @param format video output format
 * @returns output name in the same dir
 */
export function getVideoOutputPath(source: string, format: string) {
  return path.join(
    path.dirname(source),
    `${getFileNameFromPath(source)}-${getCurrentDateTime()}.${format}`,
  );
}

// we will create folder to prevent ffmpeg ask for folder creation
export async function createOutputFolder(output: string) {
  await fsp.mkdir(path.dirname(output), { recursive: true });
}

export function convertBitrateToMbps(bitrate: number): number {
  const mbps = bitrate / 1e6;
  const rounded = Math.round(mbps * 100) / 100;
  const stringValue = rounded.toFixed(2);
  return stringValue.endsWith(".00")
    ? parseInt(stringValue, 10)
    : parseFloat(stringValue);
}

/**
 * calculate crf value base on video resolution
 *
 * https://handbrake.fr/docs/en/1.9.0/workflow/adjust-quality.html
 * @param pixelCount resolution pixels
 * @returns constant frame rate
 */
export function calculateCrfByPixelCount(pixelCount: number): number {
  const CRF_THRESHOLDS = [
    { pixelCount: 8_294_400, crf: 22 },
    { pixelCount: 2_073_600, crf: 20 },
    { pixelCount: 921_600, crf: 19 },
  ] as const;

  const threshold = CRF_THRESHOLDS.find((t) => pixelCount >= t.pixelCount);
  return threshold?.crf ?? 18;
}

export async function getMetadataToVideoList(videoPaths: string[]) {
  const concurrency = Math.max(1, os.availableParallelism());
  const limit = pLimit(concurrency);

  const processSingleVideo = async (videoPath: string) => {
    try {
      const metadata = await getVideoMetadata(videoPath);

      if (!metadata) {
        throw new Error(`Metadata extraction failed for ${videoPath}`);
      }

      return {
        input: videoPath,
        metadata,
      };
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error(`Unknown error: ${String(error)}`);
      normalizedError.message = `[${videoPath}] ${normalizedError.message}`;
      throw normalizedError;
    }
  };

  try {
    const tasks = videoPaths.map((path) =>
      limit(() => processSingleVideo(path)),
    );

    const results = await Promise.allSettled(tasks);

    const successfulResults: VideoInfo[] = [];
    const errorLogger = console.error.bind(console);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        successfulResults.push(result.value);
      } else {
        errorLogger(`Processing failed: ${result.reason.message}`);
        // TODO: report error
      }
    });

    return successfulResults;
  } catch (error) {
    console.error("Unexpected pipeline error:", error);
    return [];
  }
}
