import { isFromGoSDK } from './is-from-go-sdk';
import { isFromTypeScriptSDK } from './is-from-typescript-sdk';
import { getFilePathsFromTypeScriptStackTrace } from './get-file-paths-from-typescript-stack-trace';
import { getFilePathsFromGoStackTrace } from './get-file-paths-from-go-stack-trace';
export const getFilePathsFromStackTrace = (stackTraceText) => {
    if (isFromTypeScriptSDK(stackTraceText)) {
        return getFilePathsFromTypeScriptStackTrace(stackTraceText);
    }
    else if (isFromGoSDK(stackTraceText)) {
        return getFilePathsFromGoStackTrace(stackTraceText);
    }
    else
        return undefined;
};
