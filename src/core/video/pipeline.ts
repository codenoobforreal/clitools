import os from "node:os";
import pLimit from "p-limit";
import {
  ExtractVideoMetadataError,
  NothingToProcessError,
} from "../../error.js";
import type { VideoInfo } from "../../types.js";
import { resolveAndNormalizePath } from "../../utils/path.js";
import { sanitizePathLikeInput } from "../../utils/sanitize.js";
import { getVideoPathsFromPath } from "./collector.js";
import { getVideoMetadata } from "./metadata.js";

export async function getMetadataToVideoList(videoPaths: string[]) {
  const concurrency = Math.max(1, os.availableParallelism());
  const limit = pLimit(concurrency);

  const processSingleVideo = async (videoPath: string) => {
    try {
      const metadata = await getVideoMetadata(videoPath);
      if (!metadata) {
        throw new ExtractVideoMetadataError("Metadata extraction failed");
      }
      return {
        input: videoPath,
        metadata,
      };
    } catch (error) {
      const normalizedError =
        error instanceof ExtractVideoMetadataError
          ? error
          : new Error(`Unknown error`, { cause: error });
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
    // const errorLogger = console.error.bind(console);
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        successfulResults.push(result.value);
      } else {
        // TODO: report error
        // errorLogger(`Processing failed: ${result.reason.message}`);
      }
    });
    return successfulResults;
  } catch {
    // console.error("Unexpected pipeline error:", error);
    return [];
  }
}

export async function getVideoInfoListFromUserInput(
  input: string,
): Promise<VideoInfo[]> {
  const sanitizedPath = sanitizePathLikeInput(input);
  const normalizedPath = resolveAndNormalizePath(sanitizedPath, process.cwd());
  const collectedVideoPaths: string[] =
    await getVideoPathsFromPath(normalizedPath);
  if (collectedVideoPaths.length === 0) {
    throw new NothingToProcessError("No supported video files found");
  }
  const videoInfoList = await getMetadataToVideoList(collectedVideoPaths);
  if (videoInfoList.length === 0) {
    throw new NothingToProcessError(
      "No processable videos with valid metadata available",
    );
  }
  return videoInfoList;
}

export function filterHev1Video(videoInfoList: VideoInfo[]) {
  return videoInfoList.filter(
    (v) =>
      v.metadata.codec_name === "hevc" &&
      v.metadata.codec_tag_string === "hev1",
  );
}
