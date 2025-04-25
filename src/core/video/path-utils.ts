import path from "node:path";
import { getCurrentDateTime } from "../../utils/date.js";
import { getFileNameFromPath } from "../../utils/path.js";

// other path related logic
// file-collection.ts is for collecting files from path

/**
 * get output path by the video input path
 * @param source video input path
 * @param format video output format
 * @returns output name in the same dir
 */
export function getVideoOutputPath(source: string, format: string) {
  return path.join(
    path.dirname(source),
    `${getFileNameFromPath(source)}-${getCurrentDateTime()}.${format}`,
  );
}
