import { SUPPORT_IMAGE_EXT } from "../../constants.js";
import { isImageFile } from "../../libs/file-type.js";
import { getFilePathsFromPath } from "../../utils/path-scaner.js";

export async function getImagePathsFromPath(path: string) {
  return getFilePathsFromPath(path, {
    extensions: [...SUPPORT_IMAGE_EXT],
    validateFn: isImageFile,
  });
}
