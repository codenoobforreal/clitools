import { spawn } from "child_process";
import type { ProgressInfo } from "../../types.js";
import { parseProgressLine } from "./progress-parser.js";

export function spawnFFmpegProcess(
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
  });
}

export function spawnFFprobeProcess(
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
      reject(Object.assign(error, { out, err }));
    };

    signal?.addEventListener("abort", () => {
      if (!child.killed) child.kill("SIGKILL");
    });

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.on("error", handleError);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited with code ${code}: ${err}`));
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

// export function spawnFFmpegProcess(
//   args: string[],
//   onProgress: (progress: ProgressInfo) => void,
//   signal?: AbortSignal,
// ): Promise<{ out: string; err: string }> {
//   return new Promise((resolve, reject) => {
//     let stdout = "";
//     let stderr = "";
//     let buffer = "";
//     let currentProgress: Partial<ProgressInfo> = {};

//     const child = spawn("ffmpeg", args, {
//       windowsHide: true,
//       signal,
//     });

//     const handleError = (error: Error) => {
//       // child.kill();
//       reject(Object.assign(error, { stdout, stderr }));
//     };

//     /**
//      * block is like:
//      *
//      * frame=7
//      * fps=1.39
//      * stream_0_0_q=23.5
//      * bitrate=62916.3kbits/s
//      * total_size=1572908
//      * out_time_us=200000
//      * out_time_ms=200000
//      * out_time=00:00:00.200000
//      * dup_frames=0
//      * drop_frames=0
//      * speed=0.0397x
//      * progress=continue
//      */
//     const processProgressBlock = () => {
//       if (Object.keys(currentProgress).length > 0) {
//         onProgress(currentProgress as ProgressInfo);
//         currentProgress = {};
//       }
//     };

//     child.on("error", handleError);

//     child.on("close", (code, signal) => {
//       if (buffer.length > 0) {
//         buffer.split("\n").forEach(processLine);
//         processProgressBlock();
//       }

//       if (code === 0) {
//         resolve({ out: stdout, err: stderr });
//       } else {
//         const error = new Error(
//           `FFmpeg exited with code ${code}${signal ? ` (signal: ${signal})` : ""}`,
//         );
//         handleError(Object.assign(error, { code, signal, stdout, stderr }));
//       }
//     });

//     child.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     child.stderr.on("data", (data) => {
//       const chunk = data.toString();
//       stderr += chunk;
//       buffer += chunk;
//       const lines = buffer.split(/\r?\n/);
//       buffer = lines.pop() || "";

//       lines.forEach(processLine);
//     });

//     const processLine = (line: string) => {
//       const parsed = parseProgressLine(line);
//       if (!parsed) return;
//       Object.assign(currentProgress, parsed);
//       // dealing line: progress=continue
//       if (parsed.progress !== undefined) {
//         processProgressBlock();
//       }
//     };
//   });
// }
