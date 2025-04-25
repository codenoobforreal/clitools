import path from "node:path";

export function sanitizePathLikeInput(rawInput: string) {
  return rawInput.trim().replace(/[\\/]+/g, path.sep);
}
