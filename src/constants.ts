export const SUPPORT_VIDEO_EXT = [
  "avi",
  "dash",
  "flv",
  "m4v",
  "mkv",
  "mov",
  "mp4",
  "mpeg",
  "rmvb",
  "ts",
  "webm",
  "wmv",
] as const;

export const SUPPORT_IMAGE_EXT = ["gif", "jpeg", "jpg", "png", "webp"] as const;

export const TASK_TYPE = [
  "video-encode",
  "image-encode",
  "hevc-enable-QuickTime",
] as const;
