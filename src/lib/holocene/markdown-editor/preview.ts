export const normalizePreviewContent = (
  content: string,
  singleLine: boolean,
): string =>
  singleLine ? content.replace(/[ \t]*(?:\r\n?|\n)+[ \t]*/g, ' ') : content;
