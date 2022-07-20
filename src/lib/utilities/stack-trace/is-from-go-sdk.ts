export const isFromGoSDK = (
  stackTraceText: string
): boolean => {
  return /(?:.go:\d)/.test(stackTraceText); //contains '.go:' followed by a digit
};