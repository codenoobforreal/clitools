import { glob } from "glob";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import pLimit from "p-limit";
import { SUPPORT_VIDEO_EXT } from "../../constants.js";
import type { VideoEncodeInfo } from "../../types.js";
import {
  getCurrentDateTime,
  getFileNameFromPath,
  isVideoFile,
} from "../../utils.js";

export async function collectSupportedVideoFilesFromDirectory(
  directoryPath: string,
) {
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

export function filterHighBitrateVideos(info: VideoEncodeInfo): boolean {
  const { metadata } = info;
  const { width, height, bit_rate } = metadata;
  const pixels = width * height;

  const BITRATE_THRESHOLDS = [
    { pixels: 8_294_400, maxBitrate: 20 }, // 4K 15-25
    { pixels: 3_686_400, maxBitrate: 15 }, // 2K 12-18
    { pixels: 2_073_600, maxBitrate: 13 }, // 1080p 10-16
    { pixels: 921_600, maxBitrate: 5 }, // 720p 4-6
    { pixels: 0, maxBitrate: 2.25 }, // lower 720p 1.5-3
  ];

  const bitRateInMbps = convertBitrateToMbps(bit_rate);

  for (const { pixels: thresholdPixels, maxBitrate } of BITRATE_THRESHOLDS) {
    if (pixels >= thresholdPixels) {
      return bitRateInMbps > maxBitrate;
    }
  }

  return bitRateInMbps > 2.25;
}
