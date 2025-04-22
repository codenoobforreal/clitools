import { createProgressHandler } from "../../cli.js";
import type { VideoEncodeInfo } from "../../types.js";
import {
  buildFFmpegEncodeVideoArgs,
  runFFmpegCommandWithProgressReport,
} from "../ffmpeg/commands.js";
import { createOutputFolder } from "./utils.js";

export async function encodeVideo({ input, metadata }: VideoEncodeInfo) {
  const encodeArgs = buildFFmpegEncodeVideoArgs({
    metadata,
    input,
  });

  const output = encodeArgs[encodeArgs.length - 1];
  if (output) {
    await createOutputFolder(output);
  }

  return await runFFmpegCommandWithProgressReport(
    encodeArgs,
    createProgressHandler(metadata.duration),
  );
}
