import { checkFFmpegInstallation } from "../../core/ffmpeg/checker.js";
import { askForContinue } from "../../libs/prompt.js";
import { enableHEVCQuickTimeTask } from "../enable-quickTime/index.js";
import { encodeImageTask } from "../encode-image/index.js";
import { encodeVideoTask } from "../encode-video/index.js";
import { getTaskDetail } from "./task-detail.js";

const taskHandlers = {
  "video-encode": { checkFFmpeg: true, handler: encodeVideoTask },
  "hevc-enable-QuickTime": {
    checkFFmpeg: true,
    handler: enableHEVCQuickTimeTask,
  },
  "image-encode": { checkFFmpeg: false, handler: encodeImageTask },
};

export async function runCli() {
  const { task, answer } = await getTaskDetail();
  const shouldContinue = await askForContinue();
  if (!shouldContinue) {
    return;
  }
  const config = taskHandlers[task];
  if (config.checkFFmpeg) checkFFmpegInstallation();
  await config.handler(answer);
}
