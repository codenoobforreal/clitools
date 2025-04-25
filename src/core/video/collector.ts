import { SUPPORT_VIDEO_EXT } from "../../constants.js";
import { isPathDirectory, isVideoFile } from "../../libs/file-type.js";
import { collectFilesFromDirectory } from "../../utils/file-collector.js";

// collect video files from path

export async function getVideoPathsFromPath(path: string) {
  const isDirectory = await isPathDirectory(path);
  const videoPaths: string[] = [];
  if (!isDirectory) {
    videoPaths.push(path);
  } else {
    const videosInDirectory = await collectFilesFromDirectory(path, {
      pattern: generateVideoFilePattern(),
      validator: validateVideoFile,
    });
    videoPaths.push(...videosInDirectory);
  }
  return videoPaths;
}

async function validateVideoFile(videoPath: string) {
  try {
    const isValid = await isVideoFile(videoPath);
    return isValid ? videoPath : null;
  } catch (error) {
    console.error(`Failed to validate file: ${videoPath}`, error);
    return null;
  }
}

function generateVideoFilePattern(): string {
  const extensions = SUPPORT_VIDEO_EXT.flatMap((ext) => [
    ext,
    ext.toUpperCase(),
  ]);
  return `**/*.{${extensions.join(",")}}`;
}
