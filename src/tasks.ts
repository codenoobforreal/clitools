import { log } from "@clack/prompts";
import os from "node:os";
import process from "node:process";
import pLimit from "p-limit";
import { encodeVideo } from "./features/video/encode.js";
import { getVideoMetaData as getVideoMetadata } from "./features/video/metadata.js";
import {
  collectSupportedVideoFilesFromDirectory,
  filterHighBitrateVideos,
} from "./features/video/utils.js";
import {
  isErrnoException,
  type ProcessVideoEncodeTaskProps,
  type VideoEncodeInfo,
} from "./types.js";
import {
  isPathDirectory,
  resolveAndNormalizePath,
  sanitizeUserInput,
} from "./utils.js";

export async function processVideoEncodeTask({
  input,
  filterHighBitrateMode,
}: ProcessVideoEncodeTaskProps) {
  try {
    const sanitizedPath = sanitizeUserInput(input);
    const normalizedPath = await resolveAndNormalizePath(
      sanitizedPath,
      process.cwd(),
    );

    const collectedVideoPaths: string[] =
      await collectVideoFilesFromUserInput(normalizedPath);

    const videoEncodeInfoList: VideoEncodeInfo[] =
      await getMetadataToVideoList(collectedVideoPaths);

    const filteredVideos = filterVideosByBitrateCondition(
      videoEncodeInfoList,
      filterHighBitrateMode,
    );

    const filteredVideosLength = filteredVideos.length;
    // TODO: scan error class
    if (filteredVideosLength === 0) {
      throw new Error("no video to process");
    }

    for (let index = 0; index < filteredVideosLength; index++) {
      const videoInfo = filteredVideos[index];
      if (videoInfo !== undefined) {
        log.message(
          `processing ${index + 1}/${filteredVideosLength}:\n${videoInfo.input}`,
        );
        const result = await encodeVideo(videoInfo);
        if (result) {
          log.success(`complete encoding:\n${videoInfo.input}`);
        }
      }
    }
  } catch (error) {
    // ENOENT	No such file or directory
    // EACCES	Permission denied
    // ENAMETOOLONG	File name too long
    // ELOOP	Symbolic link loop
    if (isErrnoException(error)) {
      if (error.code === "ENOENT") {
        console.log(`no such path:\n${error.path}`);
      }
    } else {
      console.log(error);
    }
  }
}

function filterVideosByBitrateCondition(
  videos: VideoEncodeInfo[],
  filterOption: boolean,
) {
  return filterOption
    ? videos.filter((info) => filterHighBitrateVideos(info))
    : videos;
}

async function getMetadataToVideoList(videoPaths: string[]) {
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

    const successfulResults: VideoEncodeInfo[] = [];
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

async function collectVideoFilesFromUserInput(userInputPath: string) {
  const isDirectory = await isPathDirectory(userInputPath);
  const collectedVideoPaths: string[] = [];
  if (!isDirectory) {
    collectedVideoPaths.push(userInputPath);
  } else {
    const videosInDirectory =
      await collectSupportedVideoFilesFromDirectory(userInputPath);
    collectedVideoPaths.push(...videosInDirectory);
  }
  return collectedVideoPaths;
}
