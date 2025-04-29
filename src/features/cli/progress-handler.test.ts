import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressInfo } from "../../types";
import { createProgressHandler } from "./progress-handler";

describe("createProgressHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  const mockMessageHandler = {
    message: vi.fn(),
  };

  it('should handle "end" event by sending 100% completion', () => {
    const handler = createProgressHandler(100, mockMessageHandler);
    handler({ progress: "end", out_time_ms: 1_000_000, speed: 1 });
    expect(mockMessageHandler.message).toBeCalledWith("[100%] eta: 00:00:00");
  });

  it("should skip processing when missing critical fields", () => {
    const handler = createProgressHandler(100, mockMessageHandler);
    handler({ speed: 1 } as ProgressInfo);
    handler({ out_time_ms: 1_000_000 } as ProgressInfo);
    handler({});
    expect(mockMessageHandler.message).not.toBeCalled();
  });

  it("should throttle updates to once per second", () => {
    vi.useFakeTimers();
    const handler = createProgressHandler(100, mockMessageHandler);
    const baseTime = Date.now();

    vi.setSystemTime(baseTime);
    handler({ out_time_ms: 0, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    handler({ out_time_ms: 50_000_000, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1100);
    handler({ out_time_ms: 100_000_000, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toHaveBeenCalledTimes(2);
  });

  it("should calculate percentage correctly with upper limit", () => {
    const handler = createProgressHandler(100, mockMessageHandler);
    handler({ out_time_ms: 150_000_000, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toBeCalledWith(
      expect.stringContaining("99.99%"),
    );
  });

  it("should calculate ETA correctly and prevent negative values", () => {
    const handler = createProgressHandler(100, mockMessageHandler);
    handler({ out_time_ms: 150_000_000, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toBeCalledWith(
      expect.stringContaining("00:00:00"),
    );
  });

  it("should format progress message with correct padding", () => {
    vi.useFakeTimers();
    const handler = createProgressHandler(100, mockMessageHandler);
    const baseTime = Date.now();

    vi.setSystemTime(baseTime);
    handler({ out_time_ms: 5_000_000, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toBeCalledWith(
      "[  5.00%] eta: 00:01:35",
    );

    vi.advanceTimersByTime(2000);
    handler({ out_time_ms: 75_000_000, speed: 1 } as ProgressInfo);
    expect(mockMessageHandler.message).toBeCalledWith(
      "[ 75.00%] eta: 00:00:25",
    );
  });
});
