import { log } from "@clack/prompts";
import process from "node:process";
import {
  type ProcessHEVCEnableQuickTimeTaskProps,
  type ProcessVideoEncodeTaskProps,
  type VideoInfo,
} from "../../types.js";
import { resolveAndNormalizePath, sanitizeUserInput } from "../../utils.js";
import { checkFFmpegInstallation } from "../ffmpeg/check-install.js";
import {
  buildFFmpegEncodeVideoArgs,
  buildHEVCEnableQuickTimeArgs,
  runFFmpegCommand,
} from "../ffmpeg/commands.js";
import {
  collectVideoFilesFromPath,
  getMetadataToVideoList,
} from "../video/utils.js";
import { createProgressHandler } from "./progress-handler.js";

export async function processVideoEncodeTask({
  input,
}: ProcessVideoEncodeTaskProps) {
  checkFFmpegInstallation();

  const videoInfoList: VideoInfo[] = await getVideoInfoListFromUserInput(input);

  for (let index = 0; index < videoInfoList.length; index++) {
    const videoInfo = videoInfoList[index];
    if (videoInfo !== undefined) {
      log.message(
        `processing ${index + 1}/${videoInfoList.length}:\n${videoInfo.input}`,
      );
      const result = await runFFmpegCommand(
        buildFFmpegEncodeVideoArgs(videoInfo),
        createProgressHandler(videoInfo.metadata.duration),
      );
      if (result) {
        log.success("complete!");
      }
    }
  }
}

export async function processHEVCEnableQuickTimeTask({
  input,
}: ProcessHEVCEnableQuickTimeTaskProps) {
  checkFFmpegInstallation();

  const videoInfoList: VideoInfo[] = await getVideoInfoListFromUserInput(input);

  const filterHev1Videos = videoInfoList.filter(
    (v) =>
      v.metadata.codec_name === "hevc" &&
      v.metadata.codec_tag_string === "hev1",
  );

  for (let index = 0; index < filterHev1Videos.length; index++) {
    const videoInfo = filterHev1Videos[index];
    if (videoInfo !== undefined) {
      log.message(
        `processing ${index + 1}/${filterHev1Videos.length}:\n${videoInfo.input}`,
      );
      const result = await runFFmpegCommand(
        buildHEVCEnableQuickTimeArgs(videoInfo),
      );
      if (result) {
        log.success("complete!");
      }
    }
  }
}

async function getVideoInfoListFromUserInput(input: string) {
  const sanitizedPath = sanitizeUserInput(input);
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
