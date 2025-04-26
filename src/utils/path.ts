import path from "node:path";

// Functions related to file paths and extensions

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

export function resolveAndNormalizePath(
  inputPath: string,
  baseDir: string,
): string {
  const resolvedPath = path.isAbsolute(inputPath)
    ? path.normalize(inputPath)
    : path.resolve(baseDir, inputPath);
  return path.normalize(resolvedPath);
}
