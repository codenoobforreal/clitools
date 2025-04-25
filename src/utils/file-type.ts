import { fileTypeFromFile } from "file-type";
import fsp from "node:fs/promises";

export async function isPathDirectory(filepath: string) {
  return (await fsp.lstat(filepath)).isDirectory();
}

export async function isVideoFile(filepath: string) {
  return (await fileTypeFromFile(filepath))?.mime.startsWith("video");
}

export async function isImageFile(filepath: string) {
  return (await fileTypeFromFile(filepath))?.mime.startsWith("image");
}
