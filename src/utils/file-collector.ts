import { createConcurrencyLimit } from "../libs/concurrency.js";
import { globSearchFileEntries } from "../libs/glob.js";

export async function collectFilesFromDirectory(
  directoryPath: string,
  options: {
    pattern: string;
    validator: (path: string) => Promise<string | null>;
  },
) {
  const { pattern, validator } = options;
  try {
    const fileEntries = await globSearchFileEntries(directoryPath, pattern);
    const limit = createConcurrencyLimit();
    const validationTasks = fileEntries
      .filter((fileEntry) => !fileEntry.isSymbolicLink())
      .map((notSymLinkEntry) =>
        limit(() => validator(notSymLinkEntry.fullpath())),
      );
    const results = await Promise.allSettled(validationTasks);
    return results.flatMap((result) =>
      result.status === "fulfilled" && result.value ? [result.value] : [],
    );
  } catch (error) {
    console.error("Failed to scan directory:", error);
    return [];
  }
}
