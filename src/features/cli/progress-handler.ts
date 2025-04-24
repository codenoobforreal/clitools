import type { ProgressInfo } from "../../types.js";
import { formatSeconds } from "../../utils.js";

export function createProgressHandler(totalDuration: number) {
  let lastUpdate = 0;
  // const p = progress({ max: 100 });
  return (progress: ProgressInfo) => {
    if (!progress.out_time_ms || progress.speed === undefined) return;

    if (progress.progress === "end") {
      // log.message(`100%`);
      return;
    }

    const now = Date.now();
    if (now - lastUpdate <= 1000) return;
    lastUpdate = now;

    let percentage = 0;
    const currentTime = progress.out_time_ms / 1_000_000;
    percentage = Math.min(99.99, (currentTime / totalDuration) * 100);

    let remaining = 0;
    if (percentage > 0) {
      const current = progress.out_time_ms / 1_000_000;
      remaining = Math.max(
        0,
        Math.floor((totalDuration - current) / progress.speed),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const eta = formatSeconds(remaining);
    // log.message(`[${percentage.toFixed(1).padStart(5)}%] eta: ${eta}`);
  };
}
