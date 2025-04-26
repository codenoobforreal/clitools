import { cancel, confirm, group, isCancel, select, text } from "@clack/prompts";
import type {
  EnableHEVCQuickTimeTaskProps,
  EncodeImageTaskProps,
  EncodeVideoTaskProps,
  TaskType,
} from "../types.js";

export async function askForVideoEncodeAnswer(): Promise<EncodeVideoTaskProps> {
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

export async function askForImageEncodeAnswer(): Promise<EncodeImageTaskProps> {
  return await group(
    {
      input: () =>
        text({
          message: "Enter input path",
          placeholder: "Image path or a folder of images",
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

export async function askForHEVCEnableQuickTimeAnswer(): Promise<EnableHEVCQuickTimeTaskProps> {
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

export async function askForTask(): Promise<TaskType> {
  const task = await select({
    message: "Pick a task",
    options: [
      {
        value: "video-encode",
        label:
          "H.265 video encoding with recommended quality settings (batch available)",
      },
      {
        value: "hevc-enable-QuickTime",
        label:
          "Make QuickTime-incompatible HEVC videos playable without re-encoding (batch available)",
      },
      {
        value: "image-encode",
        label: "Lossless image encoding (batch available)",
      },
    ],
  });
  if (isCancel(task)) {
    cancel("Operation canceled");
    process.exit(0);
  }
  return task;
}

export async function askForContinue(): Promise<boolean> {
  const shouldContinue = await confirm({
    message: "Do you want to continue",
  });
  if (isCancel(shouldContinue)) {
    cancel("Operation canceled");
    process.exit(0);
  }
  return shouldContinue;
}
