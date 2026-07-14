import { stringifyWithBigInt } from './parse-with-big-int';

export const downloadJson = (
  data: Record<string, unknown>,
  fileName: string,
) => {
  const content = stringifyWithBigInt(data, undefined, 2);
  const a = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};
