import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { formatSeconds, getCurrentDateTime } from "./date";

describe("getCurrentDateTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("should return the correct formatted datetime string", () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00"));
    const expected = "20000101000000";
    const result = getCurrentDateTime();
    expect(result).toBe(expected);
  });
  test("should handle zero padding for single-digit month and day", () => {
    vi.setSystemTime(new Date(2023, 0, 5, 9, 3, 7)); // 2023-01-05 09:03:07
    const expected = "20230105090307";
    const result = getCurrentDateTime();
    expect(result).toBe(expected);
  });
  test("should handle edge cases where month is December (12) and day is 31", () => {
    vi.setSystemTime(new Date(2023, 11, 31, 23, 59, 59)); // 2023-12-31 23:59:59
    const expected = "20231231235959";
    const result = getCurrentDateTime();
    expect(result).toBe(expected);
  });
});

describe("formatSeconds", () => {
  test('should format 0 seconds to "00:00:00"', () => {
    expect(formatSeconds(0)).toBe("00:00:00");
  });
  test('should format 59 seconds to "00:00:59"', () => {
    expect(formatSeconds(59)).toBe("00:00:59");
  });
  test('should format 60 seconds to "00:01:00"', () => {
    expect(formatSeconds(60)).toBe("00:01:00");
  });
  test('should format 3599 seconds to "00:59:59"', () => {
    expect(formatSeconds(3599)).toBe("00:59:59");
  });
  test('should format 3600 seconds to "01:00:00"', () => {
    expect(formatSeconds(3600)).toBe("01:00:00");
  });
  test('should format 3661 seconds to "01:01:01"', () => {
    expect(formatSeconds(3661)).toBe("01:01:01");
  });
  test('should format 86399 seconds to "23:59:59"', () => {
    expect(formatSeconds(86399)).toBe("23:59:59");
  });
  test("should format a very large number of seconds", () => {
    expect(formatSeconds(25 * 3600 + 123)).toBe("25:02:03");
  });
  test("should correctly handle values beyond 24 hours", () => {
    expect(formatSeconds(86400)).toBe("24:00:00");
  });
});
