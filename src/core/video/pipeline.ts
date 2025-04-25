import os from "node:os";
import pLimit from "p-limit";
import type { VideoInfo } from "../../types.js";
import { resolveAndNormalizePath } from "../../utils/file.js";
import { sanitizePathLikeInput } from "../../utils/sanitize.js";
import { collectVideoFilesFromPath } from "./file-collection.js";
import { getVideoMetadata } from "./metadata.js";

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

export async function getVideoInfoListFromUserInput(
  input: string,
): Promise<VideoInfo[]> {
  const sanitizedPath = sanitizePathLikeInput(input);
  const normalizedPath = await resolveAndNormalizePath(
    sanitizedPath,
    process.cwd(),
  );
  const collectedVideoPaths: string[] =
    await collectVideoFilesFromPath(normalizedPath);
  // TODO: scan error class
  if (collectedVideoPaths.length === 0) {
    throw new Error("no video to process");
  }
  return await getMetadataToVideoList(collectedVideoPaths);
}
