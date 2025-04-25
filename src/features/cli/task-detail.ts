import {
  askForHEVCEnableQuickTimeAnswer,
  askForTask,
  askForVideoEncodeAnswer,
} from "./prompt.js";

export async function getTaskDetail() {
  const task = await askForTask();
  switch (task) {
    case "video-encode": {
      const processVideoEncodeTaskProps = await askForVideoEncodeAnswer();
      return { task, answer: processVideoEncodeTaskProps };
    }
    case "hevc-enable-QuickTime": {
      const ProcessHEVCEnableQuickTimeTaskProps =
        await askForHEVCEnableQuickTimeAnswer();
      return { task, answer: ProcessHEVCEnableQuickTimeTaskProps };
    }
    default:
      throw new Error(`unknown task: ${task}`);
  }
}
