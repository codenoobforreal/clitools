import { log } from "@clack/prompts";
import { checkFFmpegInstallation } from "../../core/ffmpeg/checker.js";
import { getVideoInfoListFromUserInput } from "../../core/video/pipeline.js";
import { runFFmpegCommand } from "../../libs/ffmpeg-executor.js";
import type { EnableHEVCQuickTimeTaskProps, VideoInfo } from "../../types.js";
import { buildHEVCEnableQuickTimeArgs } from "./args.js";

export async function enableHEVCQuickTimeTask({
  input,
}: EnableHEVCQuickTimeTaskProps) {
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
