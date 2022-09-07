//  The function takes a decoded StackTraceQuery response as a string
//  It returns true if the response came from the TypeScriptSDK and false otherwise
export const isFromTypeScriptSDK = (stackTraceText) => {
    return /\w.ts:\d/.test(stackTraceText); //contains '.ts:' followed by a digit
};
