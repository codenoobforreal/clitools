import fs from "node:fs";
import { pipeline } from "node:stream";
import util from "node:util";
import sharp from "sharp";
import { generateOutputPath } from "../../utils/output-generator.js";
import { getFileExt } from "../../utils/path.js";

const promisifyPipeline = util.promisify(pipeline);

export function encodeImage(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const ext = getFileExt(input).toLowerCase();
      const outputPath = generateOutputPath(input, ext);

      const readStream = fs.createReadStream(input);
      const writeStream = fs.createWriteStream(outputPath);

      let processor: sharp.Sharp;

      switch (ext) {
        case "jpg":
        case "jpeg":
          processor = sharp().jpeg({
            quality: 100,
            optimiseScans: true,
            mozjpeg: true,
          });
          break;
        case "png":
          processor = sharp().png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            effort: 10,
          });
          break;
        case "webp":
          processor = sharp().webp({
            lossless: true,
            quality: 100,
            effort: 6,
          });
          break;
        case "gif":
          processor = sharp().gif({
            interPaletteMaxError: 0,
            dither: 0,
            effort: 10,
            reuse: true,
            progressive: false,
          });
          break;
        default:
          throw new Error(`Not supported extension: ${ext}`);
      }

      promisifyPipeline(readStream, processor, writeStream)
        .then(() => resolve(outputPath))
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}
