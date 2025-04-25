export function convertBitrateToMbps(bitrate: number): number {
  const mbps = bitrate / 1e6;
  const rounded = Math.round(mbps * 100) / 100;
  const stringValue = rounded.toFixed(2);
  return stringValue.endsWith(".00")
    ? parseInt(stringValue, 10)
    : parseFloat(stringValue);
}
