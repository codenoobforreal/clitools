import { SUPPORT_VIDEO_EXT, TASK_TYPE } from "./constants.js";

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

export interface ProcessVideoEncodeTaskProps {
  input: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProcessHEVCEnableQuickTimeTaskProps
  extends ProcessVideoEncodeTaskProps {}

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
  metadata: FFprobeResultConvertResult;
}

export interface FFprobeResultConvertResult {
  codec_name: string;
  codec_tag_string: string;
  width: number;
  height: number;
  avg_frame_rate: number;
  duration: number;
  bit_rate: number;
}

export type VideoFormat = (typeof SUPPORT_VIDEO_EXT)[number];

type VideoEncodeConfig = {
  format: VideoFormat;
  crf: number;
  width: number;
  height: number;
  avg_frame_rate: number;
};

export type VideoEncodePreset = Partial<VideoEncodeConfig> &
  Pick<VideoEncodeConfig, "format" | "width" | "height">;

export interface EncodeVideoEvaluateConfig
  extends Partial<Omit<VideoEncodeConfig, "crf" | "avg_frame_rate">> {
  crf: number;
  avg_frame_rate: number;
}

export interface EncodeVideoCommandConfig extends EncodeVideoEvaluateConfig {
  input: string;
  output: string;
}

export type TaskType = (typeof TASK_TYPE)[number];
