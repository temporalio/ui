import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';

export function formatJSON(value: string, space: 0 | 2): string {
  if (!value) return '';

  let result: string = '';

  try {
    const jsonData = parseWithBigInt(value);
    result = stringifyWithBigInt(jsonData, undefined, space);
  } catch {
    result = value;
  }

  return result;
}
