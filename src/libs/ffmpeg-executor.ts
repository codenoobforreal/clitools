import { spawn } from "child_process";
import { parseProgressLine } from "../core/ffmpeg/progress-parser.js";
import {
  FFmpegProcessError,
  FFprobeProcessError,
  SpawnProcessError,
} from "../error.js";
import type { ProgressInfo } from "../types.js";

function spawnFFmpegProcess(
  args: string[],
  signal?: AbortSignal,
  onProgress?: (progress: ProgressInfo) => void,
): Promise<{ out: string; err: string }> {
  return new Promise<{ out: string; err: string }>((resolve, reject) => {
    let out = "";
    let err = "";
    let buffer = "";
    let currentProgress: Partial<ProgressInfo> = {};

    const child = spawn("ffmpeg", args, {
      windowsHide: true,
      signal,
    });

    signal?.addEventListener("abort", () => {
      if (!child.killed) child.kill("SIGKILL");
    });

    const handleError = (error: Error) => {
      if (!child.killed) child.kill();
      reject(new SpawnProcessError(error.message, err, error));
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
        handleError(
          new Error(
            `FFmpeg exited with code ${code}${signal ? ` (signal: ${signal})` : ""}`,
          ),
        );
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
  });
}

function spawnFFprobeProcess(
  args: string[],
  signal?: AbortSignal,
): Promise<{ out: string; err: string }> {
  return new Promise((resolve, reject) => {
    let out = "";
    let err = "";
    const child = spawn("ffprobe", args, {
      windowsHide: true,
      signal,
    });
    const handleError = (error: Error) => {
      if (!child.killed) child.kill();
      reject(new SpawnProcessError(error.message, err, error));
    };
    signal?.addEventListener("abort", () => {
      if (!child.killed) child.kill("SIGKILL");
    });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.on("error", handleError);
    child.on("close", (code, signal) => {
      if (code !== 0) {
        handleError(
          new Error(
            `FFprobe exited with code ${code}${signal ? ` (signal: ${signal})` : ""}`,
          ),
        );
      } else {
        resolve({ out, err });
      }
    });
    child.stdout.on("data", (data: string) => {
      out += data;
    });
    child.stderr.on("data", (data: string) => {
      err += data;
    });
  });
}

export async function runFFprobeCommand(args: string[]) {
  const ac = new AbortController();
  try {
    return await spawnFFprobeProcess(args, ac.signal);
  } catch (error) {
    // TODO: report to console with a better way
    if (error instanceof SpawnProcessError) {
      throw new FFprobeProcessError("ffprobe process error", error);
    } else {
      throw error;
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
    return await spawnFFmpegProcess(args, ac.signal, onProgress);
  } catch (error) {
    // TODO: report to console with a better way
    if (error instanceof SpawnProcessError) {
      throw new FFmpegProcessError("ffmpeg process error", error);
    } else {
      throw error;
    }
  } finally {
    ac.abort();
  }
}
