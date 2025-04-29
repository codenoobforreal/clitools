import {
  FFprobeProcessError,
  KVError,
  RequiredFieldError,
  StringToNumberConvertError,
} from "../../error.js";
import { runFFprobeCommand } from "../../libs/ffmpeg-executor.js";
import type { FFprobeResultConvertdResult } from "../../types.js";
import { tryConvertStringToNumber } from "../../utils/basic-convert.js";
import { FFprobeCommandBuilder } from "../ffmpeg/command-builder.js";

export async function getVideoMetadata(
  videoPath: string,
): Promise<FFprobeResultConvertdResult | null> {
  const getVideoMetaDataArgs = buildFFprobeMetadataArgs(videoPath);

  const { out, err } = await runFFprobeCommand(getVideoMetaDataArgs);
  // out will be empty string and err will be error message when ffprobe got error
  if (out === "") {
    throw new FFprobeProcessError("FFprobe handle error", new Error(err));
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
    "pix_fmt",
    // "avg_frame_rate",
    "duration",
    // "bit_rate",
    "bits_per_raw_sample",
  ]);

  const parseKeyValue = (line: string): [string, string] => {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1 || eqIndex === 0) {
      throw new KVError("Invalid key-value format", line);
    }
    return [line.slice(0, eqIndex), line.slice(eqIndex + 1)];
  };

  const validateNumber = (value: string, key: string): number => {
    const num = tryConvertStringToNumber(value);
    if (!num) {
      throw new StringToNumberConvertError(`Invalid ${key} value`, value);
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
      case "pix_fmt":
        resultObject[key] = value;
        requiredFields.delete(key);
        break;

      case "width":
      case "height":
      case "duration":
        // case "bit_rate":
        resultObject[key] = validateNumber(value, key);
        requiredFields.delete(key);
        break;
      case "bits_per_raw_sample": {
        resultObject[key] = tryConvertStringToNumber(value) ?? 8;
        requiredFields.delete(key);
        break;

        // case "avg_frame_rate":
        //   resultObject.avg_frame_rate = calcFFprobeFps(value);
        //   requiredFields.delete("avg_frame_rate");
        //   break;
      }
    }
  }

  if (requiredFields.size > 0) {
    throw new RequiredFieldError("Missing required fields", [
      ...requiredFields,
    ]);
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
