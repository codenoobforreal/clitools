import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVideoInfo } from "../../utils/test-utils";
import { buildHEVCEnableQuickTimeArgs } from "./args";

describe("buildHEVCEnableQuickTimeArgs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("should build command with basic configuration", () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00"));
    const config = createVideoInfo();
    const resultString = buildHEVCEnableQuickTimeArgs(config).join(" ");

    expect(resultString).toMatch(/-hide_banner -loglevel error/);
    expect(resultString).toMatch(/-i input.mp4/);
    expect(resultString).toMatch(/-c:v copy/);
    expect(resultString).toMatch(/-f mp4/);
    expect(resultString).toMatch(/-tag:v hvc1/);
    expect(resultString).toMatch(/-c:a copy/);
    expect(resultString).toMatch(/input-20000101000000.mp4/);
  });
});
