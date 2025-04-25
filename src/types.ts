import { TASK_TYPE } from "./constants.js";

export interface ErrnoException extends Error {
  errno?: number | undefined;
  code?: string | undefined;
  path?: string | undefined;
  syscall?: string | undefined;
}

// https://stackoverflow.com/a/70887388
export function isErrnoException(error: unknown): error is ErrnoException {
  return (
    isArbitraryObject(error) &&
    error instanceof Error &&
    (typeof error["errno"] === "number" ||
      typeof error["errno"] === "undefined") &&
    (typeof error["code"] === "string" ||
      typeof error["code"] === "undefined") &&
    (typeof error["path"] === "string" ||
      typeof error["path"] === "undefined") &&
    (typeof error["syscall"] === "string" ||
      typeof error["syscall"] === "undefined")
  );
}

function isArbitraryObject(
  potentialObject: unknown,
): potentialObject is ArbitraryObject {
  return typeof potentialObject === "object" && potentialObject !== null;
}

export type ArbitraryObject = { [key: string]: unknown };

export interface EncodeVideoTaskProps {
  input: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EnableHEVCQuickTimeTaskProps extends EncodeVideoTaskProps {}

export interface ProgressInfo {
  frames?: number;
  fps?: number;
  quality?: number;
  // kbits/s
  bitrate?: number;
  total_size?: number;
  out_time_us?: number;
  out_time_ms?: number;
  out_time?: string;
  dup_frames?: number;
  drop_frames?: number;
  speed?: number;
  progress?: "continue" | "end";
}

export interface VideoInfo {
  input: string;
  metadata: FFprobeResultConvertdResult;
}

export interface FFprobeResultConvertdResult {
  codec_name: string;
  codec_tag_string: string;
  width: number;
  height: number;
  avg_frame_rate: number;
  duration: number;
  bit_rate: number;
}

export type TaskType = (typeof TASK_TYPE)[number];
