#!/usr/bin/env node

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
        console.log(`no such path:\n${error.path}`);
      }
    } else {
      console.log(error);
    }
  }
}
