import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  getFileExt,
  getFileNameFromPath,
  resolveAndNormalizePath,
} from "./file";

describe("getFileNameFromPath", () => {
  test("should extract the correct filename from a standard path", () => {
    const filePath = "/user/documents/example.txt";
    const expectedFileName = "example";
    expect(getFileNameFromPath(filePath)).toBe(expectedFileName);
  });
  test("should handle a filename without an extension", () => {
    const filePath = "/user/data/file";
    const expectedFileName = "file";
    expect(getFileNameFromPath(filePath)).toBe(expectedFileName);
  });
  test("should handle a path with multiple dots in the filename", () => {
    const filePath = "/user/configs/settings.v1.0.0.json";
    const expectedFileName = "settings.v1.0.0";
    expect(getFileNameFromPath(filePath)).toBe(expectedFileName);
  });
  test("should handle a path that is just the root directory", () => {
    const filePath = "/";
    const expectedFileName = "";
    expect(getFileNameFromPath(filePath)).toBe(expectedFileName);
  });
  test("should handle a path with no filename", () => {
    const filePath = "/user/documents/";
    const expectedFileName = "";
    expect(getFileNameFromPath(filePath)).toBe(expectedFileName);
  });
  test("should handle a relative path", () => {
    const filePath = "./config/settings.json";
    const expectedFileName = "settings";
    expect(getFileNameFromPath(filePath)).toBe(expectedFileName);
  });
});

describe("getFileExt", () => {
  test("should return the correct file extension for a simple filename", () => {
    const filepath = "file.txt";
    expect(getFileExt(filepath)).toBe("txt");
  });
  test("should return the correct extension for a full path", () => {
    const filepath = "myfolder/document.pdf";
    expect(getFileExt(filepath)).toBe("pdf");
  });
  test("should return an empty string for a filename without an extension", () => {
    const filepath = "readme";
    expect(getFileExt(filepath)).toBe("");
  });
  test("should handle multiple dots in filename correctly", () => {
    const filepath = "image.backup.tar.gz";
    expect(getFileExt(filepath)).toBe("gz");
  });
});

describe("resolveAndNormalizePath", () => {
  const baseDir =
    process.platform === "win32" ? "C:\\projects\\app" : "/home/user/app";

  test("should resolve absolute path correctly", async () => {
    const input =
      process.platform === "win32" ? "D:\\absolute\\path" : "/absolute/path";
    const result = await resolveAndNormalizePath(input, baseDir);
    expect(result).toBe(path.normalize(input));
  });

  test("should resolve relative path with base directory", async () => {
    const input = "src/../config";
    const expected =
      process.platform === "win32"
        ? "C:\\projects\\app\\config"
        : "/home/user/app/config";
    expect(await resolveAndNormalizePath(input, baseDir)).toBe(expected);
  });

  test("should handle current directory notation", async () => {
    const input = "./config/app.json";
    const expected =
      process.platform === "win32"
        ? "C:\\projects\\app\\config\\app.json"
        : "/home/user/app/config/app.json";
    expect(await resolveAndNormalizePath(input, baseDir)).toBe(expected);
  });
});
