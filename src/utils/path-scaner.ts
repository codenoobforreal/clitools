import { isPathDirectory } from "../libs/file-type.js";
import { collectFilesFromDirectory } from "./file-collector.js";

export async function getFilePathsFromPath(
  path: string,
  options: {
    extensions: string[];
    validateFn: (filePath: string) => Promise<boolean>;
  },
) {
  const isDirectory = await isPathDirectory(path);
  const paths: string[] = [];

  if (!isDirectory) {
    paths.push(path);
  } else {
    const filesInDirectory = await collectFilesFromDirectory(path, {
      pattern: generateFilePattern(options.extensions),
      validator: createFileValidator(options.validateFn),
    });
    paths.push(...filesInDirectory);
  }
  return paths;
}

function generateFilePattern(supportedExt: string[]): string {
  const extensions = supportedExt.flatMap((ext) => [ext, ext.toUpperCase()]);
  return `**/*.{${extensions.join(",")}}`;
}

export function createFileValidator(
  validateFn: (filePath: string) => Promise<boolean>,
) {
  return async (filePath: string) => {
    try {
      const isValid = await validateFn(filePath);
      return isValid ? filePath : "";
    } catch (error) {
      console.error(`Failed to validate file: ${filePath}`, error);
      return "";
    }
  };
}
