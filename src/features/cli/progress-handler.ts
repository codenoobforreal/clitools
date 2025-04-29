import type { ProgressInfo } from "../../types.js";
import { formatSeconds } from "../../utils/date.js";

export function createProgressHandler(
  totalDuration: number,
  messageHandler: {
    message: (msg?: string) => void;
  },
) {
  let lastUpdate = 0;
  let remaining = 0;

  return (progress: ProgressInfo) => {
    if (progress.out_time_ms === undefined || progress.speed === undefined)
      return;

    if (progress.progress === "end") {
      messageHandler.message(`[100%] eta: 00:00:00`);
      return;
    }

    const now = Date.now();
    if (now - lastUpdate <= 1000) return;
    lastUpdate = now;

    let percentage = 0;
    const currentTime = progress.out_time_ms / 1_000_000;
    percentage = Math.min(99.99, (currentTime / totalDuration) * 100);

    if (percentage > 0 && progress.speed > 0) {
      const current = progress.out_time_ms / 1_000_000;
      remaining = Math.max(
        0,
        Math.floor((totalDuration - current) / progress.speed),
      );
    }

    const eta = formatSeconds(remaining);
    messageHandler.message(
      `[${percentage.toFixed(2).padStart(6)}%] eta: ${eta}`,
    );
  };
}
