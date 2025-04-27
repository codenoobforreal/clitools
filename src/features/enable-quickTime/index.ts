import { spinner } from "@clack/prompts";
import {
  filterHev1Video,
  getVideoInfoListFromUserInput,
} from "../../core/video/pipeline.js";
import { FFmpegProcessError, NothingToProcessError } from "../../error.js";
import { runFFmpegCommand } from "../../libs/ffmpeg-executor.js";
import type { EnableHEVCQuickTimeTaskProps, VideoInfo } from "../../types.js";
import { buildHEVCEnableQuickTimeArgs } from "./args.js";

export async function enableHEVCQuickTimeTask({
  input,
}: EnableHEVCQuickTimeTaskProps) {
  const videoInfoList: VideoInfo[] = await getVideoInfoListFromUserInput(input);
  const filteredVideos = filterHev1Video(videoInfoList);
  if (filteredVideos.length === 0) {
    throw new NothingToProcessError("No hev1 videos found");
  }
  for (let index = 0; index < filteredVideos.length; index++) {
    const videoInfo = filteredVideos[index];
    if (videoInfo !== undefined) {
      await enableHEVCQuickTime(videoInfo, index, filteredVideos.length);
    }
  }
}

async function enableHEVCQuickTime(
  videoInfo: VideoInfo,
  index: number,
  length: number,
) {
  const s = spinner();
  s.start(`Remuxing: ${videoInfo.input}`);
  try {
    await runFFmpegCommand(buildHEVCEnableQuickTimeArgs(videoInfo));
    s.stop(`Finish remuxing ${index + 1}/${length}:\n${videoInfo.input}`);
  } catch (error) {
    let errMessage: string = `Failed to remux: ${videoInfo.input}\nerror: `;
    if (error instanceof FFmpegProcessError) {
      errMessage += error.cause.message;
    } else {
      errMessage += "unknown error";
    }
    s.stop(errMessage);
  }
}
