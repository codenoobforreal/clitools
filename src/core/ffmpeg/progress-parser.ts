import type { ProgressInfo } from "../../types.js";

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
