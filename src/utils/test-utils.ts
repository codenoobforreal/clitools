import type { FFprobeResultConvertdResult, VideoInfo } from "../types.js";

export function createVideoInfo(
  config: {
    input?: VideoInfo["input"];
    metadata?: Partial<VideoInfo["metadata"]>;
  } = {},
): VideoInfo {
  const DEFAULT_CONFIG: VideoInfo = {
    input: "input.mp4",
    metadata: createFFprobeResultConvertdResult(),
  };

  return {
    ...DEFAULT_CONFIG,
    ...config,
    metadata: {
      ...DEFAULT_CONFIG.metadata,
      ...config.metadata,
    },
  };
}

export function createFFprobeResultConvertdResult(
  result: Partial<FFprobeResultConvertdResult> = {},
): FFprobeResultConvertdResult {
  const DEFAULT_RESULT: FFprobeResultConvertdResult = {
    codec_name: "hevc",
    codec_tag_string: "hev1",
    width: 1920,
    height: 1080,
    duration: 100,
    pix_fmt: "yuv420p",
    bits_per_raw_sample: 8,
  };

  return {
    ...DEFAULT_RESULT,
    ...result,
  };
}
