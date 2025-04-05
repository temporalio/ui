import { getFilePathsFromGoStackTrace } from './get-file-paths-from-go-stack-trace';
import { getFilePathsFromTypeScriptStackTrace } from './get-file-paths-from-typescript-stack-trace';
import { isFromGoSDK } from './is-from-go-sdk';
import { isFromTypeScriptSDK } from './is-from-typescript-sdk';

export const getFilePathsFromStackTrace = (
  stackTraceText: string,
): { filePath: string; codeLine: number; character: number }[] => {
  if (isFromTypeScriptSDK(stackTraceText)) {
    return getFilePathsFromTypeScriptStackTrace(stackTraceText);
  } else if (isFromGoSDK(stackTraceText)) {
    return getFilePathsFromGoStackTrace(stackTraceText);
  } else return undefined;
};
