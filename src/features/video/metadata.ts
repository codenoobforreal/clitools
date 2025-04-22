import type { FFprobeResultConvertResult } from "../../types.js";
import {
  buildFFprobeMetadataArgs,
  runFFprobeCommand,
} from "../ffmpeg/commands.js";

export async function getVideoMetaData(
  videoPath: string,
): Promise<FFprobeResultConvertResult | null> {
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
): FFprobeResultConvertResult {
  const resultObject: Partial<FFprobeResultConvertResult> = {};

  const parseKeyValue = (line: string): [key: string, value: string] => {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      throw new Error(`Missing equals sign in key-value pair: ${line}`);
    }
    if (eqIndex === 0) {
      throw new Error(`Empty key in key-value pair: ${line}`);
    }
    const key = line.slice(0, eqIndex);
    const value = eqIndex === line.length - 1 ? "" : line.slice(eqIndex + 1);
    return [key, value];
  };

  const validateNumber = (value: string, key: string): number => {
    if (value === "") {
      throw new Error(`Empty value for numeric field ${key}`);
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid numeric value for ${key}: ${value}`);
    }
    return num;
  };

  for (const line of result.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const [key, value] = parseKeyValue(trimmed);

    switch (key) {
      case "width":
      case "height":
      case "duration":
      case "bit_rate":
        resultObject[key] = validateNumber(value, key);
        break;
      case "avg_frame_rate":
        resultObject.avg_frame_rate = calcFFprobeFps(value);
        break;
      default:
        break;
    }
  }

  const requiredKeys: (keyof FFprobeResultConvertResult)[] = [
    "width",
    "height",
    "avg_frame_rate",
    "duration",
    "bit_rate",
  ];

  requiredKeys.forEach((key) => {
    if (resultObject[key] === undefined || Number.isNaN(resultObject[key])) {
      throw new Error(`Missing or invalid required field: ${key}`);
    }
  });

  return resultObject as FFprobeResultConvertResult;
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
