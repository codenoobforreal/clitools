import { glob } from "glob";

export async function globSearchFileEntries(
  directoryPath: string,
  pattern: string,
) {
  return glob(pattern, {
    nodir: true,
    nocase: true,
    cwd: directoryPath,
    withFileTypes: true,
    follow: false,
    dot: false,
    stat: true,
  });
}
