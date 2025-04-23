import {
  cancel,
  confirm,
  group,
  intro,
  isCancel,
  select,
  text,
} from "@clack/prompts";
import type {
  ProcessVideoEncodeTaskProps,
  ProgressInfo,
  TaskType,
} from "./types.js";
import { formatSeconds } from "./utils.js";

async function askForVideoEncodeAnswer(): Promise<ProcessVideoEncodeTaskProps> {
  return await group(
    {
      input: () =>
        text({
          message: "Enter input path",
          placeholder: "Video path or a folder of videos",
          defaultValue: ".",
        }),
    },
    {
      onCancel: () => {
        cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );
}

async function askForTask(): Promise<TaskType> {
  const task = await select({
    message: "Pick a task",
    options: [
      {
        value: "video-encode",
        label: "Video Encoding",
      },
      // {
      //   value: "image-encode",
      //   label: "Image Encode",
      // },
    ],
  });
  if (isCancel(task)) {
    cancel("Operation canceled");
    process.exit(0);
  }
  return task;
}

async function askForContinue(): Promise<boolean> {
  const shouldContinue = await confirm({
    message: "Do you want to continue",
  });
  if (isCancel(shouldContinue)) {
    cancel("Operation canceled");
    process.exit(0);
  }
  return shouldContinue;
}

export async function getTaskDetail() {
  try {
    intro("Welcome to scripts!");
    const task = await askForTask();
    if (task === "video-encode") {
      const processVideoEncodeTaskProps = await askForVideoEncodeAnswer();
      const shouldContinue = await askForContinue();
      return { shouldContinue, task, answer: processVideoEncodeTaskProps };
    } else if (task === "image-encode") {
      return { shouldContinue: false };
    } else {
      return { shouldContinue: false };
    }
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
}

export function createProgressHandler(totalDuration: number) {
  let lastUpdate = 0;
  // const p = progress({ max: 100 });
  return (progress: ProgressInfo) => {
    if (!progress.out_time_ms || progress.speed === undefined) return;

    if (progress.progress === "end") {
      // log.message(`100%`);
      return;
    }

    const now = Date.now();
    if (now - lastUpdate <= 1000) return;
    lastUpdate = now;

    let percentage = 0;
    const currentTime = progress.out_time_ms / 1_000_000;
    percentage = Math.min(99.99, (currentTime / totalDuration) * 100);

    let remaining = 0;
    if (percentage > 0) {
      const current = progress.out_time_ms / 1_000_000;
      remaining = Math.max(
        0,
        Math.floor((totalDuration - current) / progress.speed),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const eta = formatSeconds(remaining);
    // log.message(`[${percentage.toFixed(1).padStart(5)}%] eta: ${eta}`);
  };
}
