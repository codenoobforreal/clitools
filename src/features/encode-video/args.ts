import { FFmpegCommandBuilder } from "../../core/ffmpeg/command-builder.js";
import { calculateCrfByPixelCount } from "../../core/video/crf-calculation.js";
import { getVideoOutputPath } from "../../core/video/path-utils.js";
import type { VideoInfo } from "../../types.js";

export function buildFFmpegEncodeVideoArgs({
  metadata,
  input,
}: VideoInfo): string[] {
  const { width, height } = metadata;
  const crf = calculateCrfByPixelCount(width * height);
  // TODO: format depends on encode requirement
  const format = "mp4";
  const output = getVideoOutputPath(input, format);

  return new FFmpegCommandBuilder()
    .addProgressReporting()
    .addInput(input)
    .setVideoEncoder("libx265", ["log-level=error"])
    .setCrf(crf)
    .setPreset()
    .setOutputFormat(format)
    .copyAudio()
    .setOutput(output)
    .build();
}
