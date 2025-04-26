import { runFFprobeCommand } from "../../libs/ffmpeg-executor.js";
import type { FFprobeResultConvertdResult } from "../../types.js";
import { FFprobeCommandBuilder } from "../ffmpeg/command-builder.js";

export async function getVideoMetadata(
  videoPath: string,
): Promise<FFprobeResultConvertdResult | null> {
  const getVideoMetaDataArgs = buildFFprobeMetadataArgs(videoPath);
  const res = await runFFprobeCommand(getVideoMetaDataArgs);
  if (res === undefined) {
    return null;
  }
  const { out, err } = res;
  // out will be empty string and err will be error message when ffprobe got error
  if (out === "") {
    // TODO: custom ffprobe error
    throw new Error(err);
  }
  return convertFFprobeResult(out);
}

// TODO: bit depth: bits_per_raw_sample=N/A
export function convertFFprobeResult(
  result: string,
): FFprobeResultConvertdResult {
  const resultObject: Partial<FFprobeResultConvertdResult> = {};

  const requiredFields = new Set<keyof FFprobeResultConvertdResult>([
    "codec_name",
    "codec_tag_string",
    "width",
    "height",
    "duration",
    "bit_rate",
    "avg_frame_rate",
  ]);

  const parseKeyValue = (line: string): [string, string] => {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1 || eqIndex === 0) {
      throw new Error(`Invalid key-value format: ${line}`);
    }
    return [line.slice(0, eqIndex), line.slice(eqIndex + 1)];
  };

  const validateNumber = (value: string, key: string): number => {
    const num = Number(value);
    if (!value.trim() || Number.isNaN(num)) {
      throw new Error(`Invalid ${key} value: ${value}`);
    }
    return num;
  };

  for (const line of result.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const [key, value] = parseKeyValue(trimmed);

    switch (key) {
      case "codec_name":
      case "codec_tag_string":
        resultObject[key] = value;
        requiredFields.delete(key);
        break;

      case "width":
      case "height":
      case "duration":
      case "bit_rate":
        resultObject[key] = validateNumber(value, key);
        requiredFields.delete(key);
        break;

      case "avg_frame_rate":
        resultObject.avg_frame_rate = calcFFprobeFps(value);
        requiredFields.delete("avg_frame_rate");
        break;
    }
  }

  if (requiredFields.size > 0) {
    throw new Error(
      `Missing required fields: ${[...requiredFields].join(", ")}`,
    );
  }

  return resultObject as FFprobeResultConvertdResult;
}

// special case: 33152000/1105061
export function calcFFprobeFps(fps: string): number {
  const splits = fps.split("/");
  const dividend = splits[0];
  const divisor = splits[1];
  const rawValue =
    divisor === "1" ? Number(dividend) : Number(dividend) / Number(divisor);
  const formatted = rawValue
    .toFixed(2)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.$/, "");

  return parseFloat(formatted);
}

export function buildFFprobeMetadataArgs(inputPath: string) {
  return new FFprobeCommandBuilder()
    .setLogLevel()
    .selectStream()
    .showEntries()
    .setOutputFormat("default=noprint_wrappers=1:nokey=0")
    .setInput(inputPath)
    .build();
}
