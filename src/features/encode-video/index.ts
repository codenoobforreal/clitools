import { log } from "@clack/prompts";
import { checkFFmpegInstallation } from "../../core/ffmpeg/check-install.js";
import { runFFmpegCommand } from "../../core/ffmpeg/commands.js";
import { getVideoInfoListFromUserInput } from "../../core/video/pipeline.js";
import type { EncodeVideoTaskProps, VideoInfo } from "../../types.js";
import { createProgressHandler } from "../cli/progress-handler.js";
import { buildFFmpegEncodeVideoArgs } from "./args.js";

export async function videoEncodeTask({ input }: EncodeVideoTaskProps) {
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
