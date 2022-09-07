//  The function takes a decoded StackTraceQuery response as a string
//  It returns true if the response came from the GoSDK and false otherwise
export const isFromGoSDK = (stackTraceText) => {
    return /\w.go:\d/.test(stackTraceText); //contains '.go:' followed by a digit
};
