/**
 * try convert string to number
 * @example
 * tryConvertStringToNumber("100") ?? 10
 * @param value string to be convert
 * @returns converted number or undefined
 */
export function tryConvertStringToNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const num = Number(trimmed);
  return Number.isNaN(num) ? undefined : num;
}
