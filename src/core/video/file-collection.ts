import { glob } from "glob";
import os from "node:os";
import pLimit from "p-limit";
import { SUPPORT_VIDEO_EXT } from "../../constants.js";
import { isPathDirectory, isVideoFile } from "../../utils/file-type.js";

// collect video files from path

export async function collectVideoFilesFromPath(path: string) {
  const isDirectory = await isPathDirectory(path);
  const collectedVideoPaths: string[] = [];
  if (!isDirectory) {
    collectedVideoPaths.push(path);
  } else {
    const videosInDirectory =
      await collectSupportedVideoFilesFromDirectory(path);
    collectedVideoPaths.push(...videosInDirectory);
  }
  return collectedVideoPaths;
}

async function collectSupportedVideoFilesFromDirectory(directoryPath: string) {
  const concurrency = Math.max(1, os.availableParallelism());
  const limit = pLimit(concurrency);

  try {
    const extensions = SUPPORT_VIDEO_EXT.flatMap((ext) => [
      ext,
      ext.toUpperCase(),
    ]);
    const pattern = `**/*.{${extensions.join(",")}}`;

    const fileEntries = await glob(pattern, {
      nodir: true,
      nocase: true,
      cwd: directoryPath,
      withFileTypes: true,
      follow: false,
      dot: false,
      stat: true,
    });

    const validationTasks = fileEntries.map((filePath) => {
      const absolutePath = filePath.fullpath();
      return limit(async () => {
        try {
          if (filePath.isSymbolicLink()) {
            return null;
          }
          const isValid = await isVideoFile(absolutePath);
          return isValid ? absolutePath : null;
        } catch (error) {
          console.error(`Failed to validate file: ${absolutePath}`, error);
          return null;
        }
      });
    });

    const results = await Promise.allSettled(validationTasks);

    return results.flatMap((result) => {
      if (result.status === "fulfilled" && result.value !== null) {
        return [result.value];
      }
      return [];
    });
  } catch (error) {
    console.error("Failed to scan diretory:", error);
    return [];
  }
}
