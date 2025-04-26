import { askForContinue } from "../../libs/prompt.js";
import { enableHEVCQuickTimeTask } from "../enable-quickTime/index.js";
import { imageEncodeTask } from "../encode-image/index.js";
import { videoEncodeTask } from "../encode-video/index.js";
import { getTaskDetail } from "./task-detail.js";

export async function runCli() {
  const { task, answer } = await getTaskDetail();
  const shouldContinue = await askForContinue();
  if (!shouldContinue) {
    return;
  }
  switch (task) {
    case "video-encode":
      await videoEncodeTask(answer);
      break;
    case "hevc-enable-QuickTime":
      await enableHEVCQuickTimeTask(answer);
      break;
    case "image-encode":
      await imageEncodeTask(answer);
      break;
  }
}
