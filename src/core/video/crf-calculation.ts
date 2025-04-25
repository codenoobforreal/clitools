/**
 * calculate crf value base on video resolution
 *
 * https://handbrake.fr/docs/en/1.9.0/workflow/adjust-quality.html
 * @param pixelCount resolution pixels
 * @returns constant frame rate
 */
export function calculateCrfByPixelCount(pixelCount: number): number {
  const CRF_THRESHOLDS = [
    { pixelCount: 8_294_400, crf: 22 },
    { pixelCount: 2_073_600, crf: 20 },
    { pixelCount: 921_600, crf: 19 },
  ] as const;

  const threshold = CRF_THRESHOLDS.find((t) => pixelCount >= t.pixelCount);
  return threshold?.crf ?? 18;
}
