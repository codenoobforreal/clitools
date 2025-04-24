import { log } from "@clack/prompts";
import { spawn } from "node:child_process";
import type { ProgressInfo, VideoInfo } from "../../types.js";
import {
  calculateCrfByPixelCount,
  getVideoOutputPath,
} from "../video/utils.js";
import { spawnFFprobeProcess } from "./process.js";

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

  setVideoTag(tag: string): this {
    this.outputOptions.push("-tag:v", tag);
    return this;
  }

  copyVideo(): this {
    this.outputOptions.push("-c:v", "copy");
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

export function buildHEVCEnableQuickTimeArgs({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  metadata,
  input,
}: VideoInfo): string[] {
  const format = "mp4";
  const output = getVideoOutputPath(input, format);

  return new FFmpegCommandBuilder()
    .addInput(input)
    .copyVideo()
    .setOutputFormat(format)
    .setVideoTag("hvc1")
    .copyAudio()
    .setOutput(output)
    .build();
}

export async function runFFprobeCommand(args: string[]) {
  const ac = new AbortController();
  try {
    return await spawnFFprobeProcess(args, ac.signal);
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message);
    } else {
      console.error(error);
    }
  } finally {
    ac.abort();
  }
}

export async function runFFmpegCommand(
  args: string[],
  onProgress?: (progress: ProgressInfo) => void,
) {
  const ac = new AbortController();
  try {
    return await new Promise<{ out: string; err: string }>(
      (resolve, reject) => {
        let out = "";
        let err = "";
        let buffer = "";
        let currentProgress: Partial<ProgressInfo> = {};

        const child = spawn("ffmpeg", args, {
          windowsHide: true,
          signal: ac.signal,
        });

        ac.signal.addEventListener("abort", () => {
          if (!child.killed) child.kill("SIGKILL");
        });

        const handleError = (error: Error) => {
          if (!child.killed) child.kill();
          reject(Object.assign(error, { out, err }));
        };

        /**
         * block is like:
         *
         * frame=7
         * fps=1.39
         * stream_0_0_q=23.5
         * bitrate=62916.3kbits/s
         * total_size=1572908
         * out_time_us=200000
         * out_time_ms=200000
         * out_time=00:00:00.200000
         * dup_frames=0
         * drop_frames=0
         * speed=0.0397x
         * progress=continue
         */
        const processProgressBlock = () => {
          if (onProgress && Object.keys(currentProgress).length > 0) {
            onProgress(currentProgress as ProgressInfo);
            currentProgress = {};
          }
        };

        const processLine = (line: string) => {
          if (!onProgress) return;
          const parsed = parseProgressLine(line);
          if (!parsed) return;
          Object.assign(currentProgress, parsed);
          if (parsed.progress !== undefined) {
            processProgressBlock();
          }
        };

        child.on("error", handleError);

        child.on("close", (code, signal) => {
          if (onProgress && buffer.length > 0) {
            buffer.split(/\r?\n/).forEach(processLine);
            processProgressBlock();
          }

          if (code === 0) {
            resolve({ out, err });
          } else {
            const error = new Error(
              `FFmpeg exited with code ${code}${signal ? ` (signal: ${signal})` : ""}`,
            );
            handleError(Object.assign(error, { code, signal, out, err }));
          }
        });

        child.stdout.on("data", (data) => {
          out += data.toString();
        });

        child.stderr.on("data", (data) => {
          const chunk = data.toString();
          err += chunk;

          if (onProgress) {
            buffer += chunk;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || "";
            lines.forEach(processLine);
          }
        });
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message);
    } else {
      console.error(error);
    }
  } finally {
    ac.abort();
  }
}

export function parseProgressLine(line: string): Partial<ProgressInfo> | null {
  const [key, value] = line.split("=");
  if (!key || !value) return null;

  const trimmedKey = key.trim();
  const trimmedValue = value.trim();

  if (trimmedValue === "N/A") return null;

  try {
    switch (trimmedKey) {
      case "frame":
        return { frames: parseInt(trimmedValue, 10) };
      case "fps":
        return { fps: parseFloat(trimmedValue) };
      case "stream_0_0_q":
        return { quality: parseFloat(trimmedValue) };
      case "bitrate":
        return { bitrate: parseFloat(trimmedValue.replace("kbits/s", "")) };
      case "total_size":
        return { total_size: parseInt(trimmedValue, 10) };
      case "out_time_us":
        return { out_time_us: parseInt(trimmedValue, 10) };
      case "out_time_ms":
        return { out_time_ms: parseInt(trimmedValue, 10) };
      case "out_time":
        return { out_time: trimmedValue };
      case "dup_frames":
        return { dup_frames: parseInt(trimmedValue, 10) };
      case "drop_frames":
        return { drop_frames: parseInt(trimmedValue, 10) };
      case "speed":
        return { speed: parseFloat(trimmedValue.replace("x", "")) };
      case "progress":
        return { progress: trimmedValue as "continue" | "end" };
      default:
        return null;
    }
  } catch (e) {
    console.warn(`Failed to parse "${line}": ${e}`);
    return null;
  }
}
