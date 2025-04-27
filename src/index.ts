#!/usr/bin/env node

import { log } from "@clack/prompts";
import { NothingToProcessError } from "./error.js";
import { runCli } from "./features/cli/index.js";
import { isErrnoException } from "./types.js";

main();

async function main() {
  try {
    await runCli();
  } catch (error) {
    // ENOENT	No such file or directory
    // EACCES	Permission denied
    // ENAMETOOLONG	File name too long
    // ELOOP	Symbolic link loop
    if (isErrnoException(error)) {
      if (error.code === "ENOENT") {
        log.error(`no such path:\n${error.path}`);
      }
    } else if (error instanceof NothingToProcessError) {
      log.error(error.message);
    }
  }
}
