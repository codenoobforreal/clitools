import { fileTypeFromFile } from "file-type";
import fsp from "node:fs/promises";

export async function isPathDirectory(filepath: string) {
  return (await fsp.lstat(filepath)).isDirectory();
}

export async function isVideoFile(filepath: string) {
  const result = await fileTypeFromFile(filepath);
  if (result === undefined) {
    return false;
  }
  return result.mime.startsWith("video");
}

export async function isImageFile(filepath: string) {
  const result = await fileTypeFromFile(filepath);
  if (result === undefined) {
    return false;
  }
  return result.mime.startsWith("image");
}
