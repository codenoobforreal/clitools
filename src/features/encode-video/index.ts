import { spinner } from "@clack/prompts";
import { getVideoInfoListFromUserInput } from "../../core/video/pipeline.js";
import { FFmpegProcessError } from "../../error.js";
import { runFFmpegCommand } from "../../libs/ffmpeg-executor.js";
import type { EncodeVideoTaskProps, VideoInfo } from "../../types.js";
import { getFileNameFromPath } from "../../utils/path.js";
import { createProgressHandler } from "../cli/progress-handler.js";
import { buildFFmpegEncodeVideoArgs } from "./args.js";

export async function encodeVideoTask({ input }: EncodeVideoTaskProps) {
  const videoInfoList: VideoInfo[] = await getVideoInfoListFromUserInput(input);
  for (let index = 0; index < videoInfoList.length; index++) {
    const videoInfo = videoInfoList[index];
    if (videoInfo !== undefined) {
      await encodeVideo(videoInfo, index, videoInfoList.length);
    }
  }
}

async function encodeVideo(
  videoInfo: VideoInfo,
  index: number,
  length: number,
) {
  const s = spinner();
  const filename = getFileNameFromPath(videoInfo.input);
  s.start(`Preparing FFmpeg staff`);
  try {
    await runFFmpegCommand(
      buildFFmpegEncodeVideoArgs(videoInfo),
      createProgressHandler(videoInfo.metadata.duration, {
        message: (msg?: string) => {
          s.message(`Encoding ${filename}: ${msg}`);
        },
      }),
    );
    s.stop(`Finish encoding ${index + 1}/${length}:\n${videoInfo.input}`);
  } catch (error) {
    let errMessage: string = `Failed to encode: ${videoInfo.input}\nerror: `;
    if (error instanceof FFmpegProcessError) {
      errMessage += error.cause.message;
    } else {
      errMessage += "unknown error";
    }
    s.stop(errMessage);
  }
}
