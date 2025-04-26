import { spinner } from "@clack/prompts";
import { encodeImage } from "../../core/image/encode.js";
import { getImageListFromUserInput } from "../../core/image/pipeline.js";
import { createConcurrencyLimit } from "../../libs/concurrency.js";
import type { EncodeImageTaskProps } from "../../types.js";

export async function imageEncodeTask({ input }: EncodeImageTaskProps) {
  const s = spinner();
  s.start(`Encoding images in: ${input}`);
  const imageList: string[] = await getImageListFromUserInput(input);
  const limit = createConcurrencyLimit();
  const tasks = imageList.map((imagePath) =>
    limit(() =>
      encodeImage(imagePath).catch((error) => {
        throw new Error(`Failed to process: ${imagePath}`, {
          cause: error,
        });
      }),
    ),
  );
  const results = await Promise.allSettled(tasks);
  const successList: string[] = [];
  const failureList: Array<Error> = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      if (result.value) {
        successList.push(result.value);
      }
    } else {
      const error =
        result.reason instanceof Error
          ? result.reason
          : new Error(`Unknown error: ${JSON.stringify(result.reason)}`);
      failureList.push(error);
    }
  });
  s.stop(`
    Task completed:
    ==========================
    Successes: ${successList.length}
    Failures: ${failureList.length}

    ${failureList.length > 0 ? "Failure details:" : ""}
    ${failureList.map((f) => `${f.message}`).join("\n")}
    `);
}
