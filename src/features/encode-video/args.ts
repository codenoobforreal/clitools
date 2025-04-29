import { FFmpegH265CommandBuilder } from "../../core/ffmpeg/command-builder.js";
import { calculateCrfByPixelCount } from "../../core/video/crf-calculation.js";
import type { VideoInfo } from "../../types.js";
import { generateOutputPath } from "../../utils/output-generator.js";

export function buildFFmpegEncodeVideoArgs({
  metadata,
  input,
}: VideoInfo): string[] {
  const { width, height, pix_fmt, bits_per_raw_sample } = metadata;
  const crf = calculateCrfByPixelCount(width * height);
  // TODO: format depends on encode requirement
  const format = "mp4";
  const output = generateOutputPath(input, format);

  return new FFmpegH265CommandBuilder()
    .addProgressReporting()
    .addInput(input)
    .setPixFmt(pix_fmt)
    .setLogLevel()
    .setProfileByPixFmt(pix_fmt)
    .setInputDepth(bits_per_raw_sample)
    .applyX265Params()
    .setCrf(crf)
    .setOutputFormat(format)
    .copyAudio()
    .setOutput(output)
    .build();
}
