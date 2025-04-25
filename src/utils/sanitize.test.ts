import process from "node:process";
import { describe, expect, test } from "vitest";
import { sanitizePathLikeInput } from "./sanitize";

describe("sanitizeUserInput", () => {
  test("should trim spaces and normalize slashes", () => {
    const input = "  test/path\\\\with//slashes   ";
    const expected =
      process.platform === "win32"
        ? "test\\path\\with\\slashes"
        : "test/path/with/slashes";
    expect(sanitizePathLikeInput(input)).toBe(expected);
  });

  test("should handle empty string", () => {
    expect(sanitizePathLikeInput("")).toBe("");
  });

  test("should handle mixed slashes", () => {
    const input = "mixed\\/slashes//and\\\\backslashes";
    const expected =
      process.platform === "win32"
        ? "mixed\\slashes\\and\\backslashes"
        : "mixed/slashes/and/backslashes";
    expect(sanitizePathLikeInput(input)).toBe(expected);
  });

  test("should handle whitespace-only input", () => {
    expect(sanitizePathLikeInput("    ")).toBe("");
  });
});
