import { describe, vi } from "vitest";

vi.mock("./utils", async () => {
  const originalModule =
    await vi.importActual<typeof import("./utils")>("./utils");
  return {
    ...originalModule,
    formatSeconds: vi.fn(),
  };
});

vi.useRealTimers();

describe.skip("createProgressHandler", () => {});
