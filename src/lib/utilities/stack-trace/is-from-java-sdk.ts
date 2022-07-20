export const isFromJavaSDK = (
  stackTraceText: string
): boolean => {
  return /(?:.java:\d)/.test(stackTraceText); //contains '.java:' followed by a digit
};