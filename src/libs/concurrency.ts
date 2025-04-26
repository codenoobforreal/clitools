import os from "node:os";
import pLimit from "p-limit";

export function createConcurrencyLimit() {
  return pLimit(Math.max(1, os.availableParallelism()));
}
