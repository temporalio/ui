import { stringifyWithBigInt } from './parse-with-big-int';

export const downloadJson = (
  data: Record<string, unknown>,
  fileName: string,
) => {
  const content = stringifyWithBigInt(data, undefined, 2);
  const a = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
