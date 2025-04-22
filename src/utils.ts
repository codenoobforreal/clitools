import { fileTypeFromFile } from "file-type";
import fsp from "node:fs/promises";
import path from "node:path";

export function getCurrentDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = zeroPad(date.getMonth() + 1);
  const day = zeroPad(date.getDate());
  const hours = zeroPad(date.getHours());
  const minutes = zeroPad(date.getMinutes());
  const seconds = zeroPad(date.getSeconds());
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`;
}

function zeroPad(num: number) {
  return num.toString().padStart(2, "0");
}

/**
 * get the filename of a the path
 *
 * eg:file.ext => file
 * @param filepath file path
 * @returns filename
 */
export function getFileNameFromPath(filepath: string) {
  if (filepath.endsWith("\\") || filepath.endsWith("/")) {
    return "";
  }
  return path.parse(filepath).name;
}

export function getFileExt(filepath: string): string {
  return path.extname(filepath).slice(1);
}

export async function isPathDirectory(filepath: string) {
  return (await fsp.lstat(filepath)).isDirectory();
}

export async function isVideoFile(filepath: string) {
  return (await fileTypeFromFile(filepath))?.mime.startsWith("video");
}

export async function isImageFile(filepath: string) {
  return (await fileTypeFromFile(filepath))?.mime.startsWith("image");
}

export function sanitizeUserInput(rawInput: string) {
  return rawInput.trim().replace(/[\\/]+/g, path.sep);
}

export async function resolveAndNormalizePath(
  inputPath: string,
  baseDir: string,
): Promise<string> {
  const resolvedPath = path.isAbsolute(inputPath)
    ? path.normalize(inputPath)
    : path.resolve(baseDir, inputPath);
  return path.normalize(resolvedPath);
}
