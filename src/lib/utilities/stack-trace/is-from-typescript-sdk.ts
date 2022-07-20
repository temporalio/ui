export const isFromTypeScriptSDK = (
  stackTraceText: string
): boolean => {
  return /(?:.ts:\d)/.test(stackTraceText); //contains '.ts:' followed by a digit
};