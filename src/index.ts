#!/usr/bin/env node

import process from "node:process";
import { getTaskDetail } from "./features/cli/cli.js";
import { askForContinue } from "./features/cli/prompt.js";
import {
  processHEVCEnableQuickTimeTask,
  processVideoEncodeTask,
} from "./features/cli/tasks.js";
import { isErrnoException } from "./types.js";

main();

async function main() {
  try {
    const { task, answer } = await getTaskDetail();
    const shouldContinue = await askForContinue();
    if (!shouldContinue) {
      return;
    }
    switch (task) {
      case "video-encode":
        await processVideoEncodeTask(answer);
        break;
      case "hevc-enable-QuickTime":
        await processHEVCEnableQuickTimeTask(answer);
        break;
    }
  } catch (error) {
    // ENOENT	No such file or directory
    // EACCES	Permission denied
    // ENAMETOOLONG	File name too long
    // ELOOP	Symbolic link loop
    if (isErrnoException(error)) {
      if (error.code === "ENOENT") {
        console.log(`no such path:\n${error.path}`);
      }
    } else {
      console.log(error);
    }
  }
  }
}
