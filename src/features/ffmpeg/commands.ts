import { log } from "@clack/prompts";
import type { ProgressInfo, VideoEncodeInfo } from "../../types.js";
import {
  calculateCrfByPixelCount,
  getVideoOutputPath,
} from "../video/utils.js";
import { spawnFFmpegProcess, spawnFFprobeProcess } from "./process.js";

class FFmpegCommandBuilder {
  private globalOptions: string[] = ["-hide_banner", "-loglevel", "error"];
  private inputs: string[] = [];
  private outputOptions: string[] = [];
  private outputFile: string = "";
  private encoderToEncodeParamsKeyMap = {
    libx265: "-x265-params" as const,
  };

  addProgressReporting(progressOutput: string = "pipe:2"): this {
    this.globalOptions.push("-progress", progressOutput);
    return this;
  }

  addInput(inputPath: string): this {
    this.inputs.push("-i", inputPath);
    return this;
  }

  setVideoEncoder(encoder: string, encoderParams?: string[]): this {
    this.outputOptions.push("-c:v", encoder);
    if (encoderParams) {
      this.outputOptions.push(
        this.encoderToEncodeParamsKeyMap["libx265"],
        ...encoderParams,
      );
    }
    return this;
  }

  setCrf(crf: number): this {
    this.outputOptions.push("-crf", crf.toString());
    return this;
  }

  setPreset(preset: string = "veryfast"): this {
    this.outputOptions.push("-preset", preset);
    return this;
  }

  setOutputFormat(format: string): this {
    this.outputOptions.push("-f", format);
    return this;
  }

  copyAudio(): this {
    this.outputOptions.push("-c:a", "copy");
    return this;
  }

  setOutput(outputPath: string): this {
    this.outputFile = outputPath;
    return this;
  }

  build(): string[] {
    return [
      ...this.globalOptions,
      ...this.inputs,
      ...this.outputOptions,
      this.outputFile,
    ];
  }
}

class FFprobeCommandBuilder {
  private globalOptions: string[] = [];
  private outputFormat: string[] = [];
  private inputPath: string = "";

  setLogLevel(level: string = "error"): this {
    this.globalOptions.push("-v", level);
    return this;
  }

  selectStream(streamType: string = "v:0"): this {
    this.globalOptions.push("-select_streams", streamType);
    return this;
  }

  showEntries(entry: string = "stream:format"): this {
    this.globalOptions.push("-show_entries", entry);
    return this;
  }

  setOutputFormat(formatOptions: string): this {
    this.outputFormat.push("-of", formatOptions);
    return this;
  }

  setInput(inputPath: string): this {
    this.inputPath = inputPath;
    return this;
  }

  build(): string[] {
    return [...this.globalOptions, ...this.outputFormat, this.inputPath];
  }
}

export function buildFFprobeMetadataArgs(inputPath: string) {
  return new FFprobeCommandBuilder()
    .setLogLevel()
    .selectStream()
    .showEntries()
    .setOutputFormat("default=noprint_wrappers=1:nokey=0")
    .setInput(inputPath)
    .build();
}

export function buildFFmpegEncodeVideoArgs({
  metadata,
  input,
}: VideoEncodeInfo): string[] {
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

export async function runFFprobeCommand(args: string[]) {
  const ac = new AbortController();
  try {
    return await spawnFFprobeProcess(args, ac.signal);
  } catch (error) {
    console.error(error);
  } finally {
    ac.abort();
  }
}

export async function runFFmpegCommandWithProgressReport(
  args: string[],
  onProgress: (progress: ProgressInfo) => void,
) {
  const ac = new AbortController();
  try {
    return await spawnFFmpegProcess(args, onProgress, ac.signal);
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message);
    }
    console.error(error);
  } finally {
    ac.abort();
  }
}
