import { NothingToProcessError } from "../../error.js";
import { resolveAndNormalizePath } from "../../utils/path.js";
import { sanitizePathLikeInput } from "../../utils/sanitize.js";
import { getImagePathsFromPath } from "./collector.js";

export async function getImageListFromUserInput(
  input: string,
): Promise<string[]> {
  const sanitizedPath = sanitizePathLikeInput(input);
  const normalizedPath = resolveAndNormalizePath(sanitizedPath, process.cwd());
  const collectedImagePaths: string[] =
    await getImagePathsFromPath(normalizedPath);
  // TODO: scan error class
  if (collectedImagePaths.length === 0) {
    throw new NothingToProcessError("no image to process");
  }
  return collectedImagePaths;
}
