#!/usr/bin/env node

import { getTaskDetail } from "./cli.js";
import { processVideoEncodeTask } from "./tasks.js";

main();

async function main() {
  try {
    const { shouldContinue, task, answer } = await getTaskDetail();
    if (!shouldContinue) {
      return;
    }
    if (task === "video-encode") {
      await processVideoEncodeTask(answer);
    }
  } catch (error) {
    console.log(error);
  }
}
