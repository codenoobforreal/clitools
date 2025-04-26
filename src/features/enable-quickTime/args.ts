import { FFmpegCommandBuilder } from "../../core/ffmpeg/command-builder.js";
import type { VideoInfo } from "../../types.js";
import { generateOutputPath } from "../../utils/output-generator.js";

export function buildHEVCEnableQuickTimeArgs({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  metadata,
  input,
}: VideoInfo): string[] {
  const format = "mp4";
  const output = generateOutputPath(input, format);

  return new FFmpegCommandBuilder()
    .addInput(input)
    .copyVideo()
    .setOutputFormat(format)
    .setVideoTag("hvc1")
    .copyAudio()
    .setOutput(output)
    .build();
}
