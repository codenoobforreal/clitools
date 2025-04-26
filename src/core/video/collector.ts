import { SUPPORT_VIDEO_EXT } from "../../constants.js";
import { isVideoFile } from "../../libs/file-type.js";
import { getFilePathsFromPath } from "../../utils/path-scaner.js";

export async function getVideoPathsFromPath(path: string) {
  return getFilePathsFromPath(path, {
    extensions: [...SUPPORT_VIDEO_EXT],
    validateFn: isVideoFile,
  });
}
