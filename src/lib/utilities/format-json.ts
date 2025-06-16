import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';

export function formatJSON(jsonData: string, space: 0 | 2): string {
  if (!jsonData) return;

  let parsedData: string;

  try {
    parsedData = parseWithBigInt(jsonData);
  } catch (error) {
    parsedData = jsonData;
  }

  return stringifyWithBigInt(parsedData, undefined, space);
}
