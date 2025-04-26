import {
  askForHEVCEnableQuickTimeAnswer,
  askForImageEncodeAnswer,
  askForTask,
  askForVideoEncodeAnswer,
} from "../../libs/prompt.js";

export async function getTaskDetail() {
  const task = await askForTask();
  switch (task) {
    case "video-encode": {
      const processVideoEncodeTaskProps = await askForVideoEncodeAnswer();
      return { task, answer: processVideoEncodeTaskProps };
    }
    case "hevc-enable-QuickTime": {
      const processHEVCEnableQuickTimeTaskProps =
        await askForHEVCEnableQuickTimeAnswer();
      return { task, answer: processHEVCEnableQuickTimeTaskProps };
    }
    case "image-encode": {
      const processImageEncodeTaskProps = await askForImageEncodeAnswer();
      return { task, answer: processImageEncodeTaskProps };
    }
  }
}
