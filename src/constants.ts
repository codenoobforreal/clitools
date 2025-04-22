export const SUPPORT_VIDEO_EXT = [
  "avi",
  "flv",
  "mp4",
  "mkv",
  "mov",
  "rmvb",
  "ts",
  "webm",
  "wmv",
] as const;

export const SUPPORT_IMAGE_EXT = ["jpg", "jpeg", "png"] as const;

export const TASK_TYPE = ["video-encode", "image-encode"] as const;
