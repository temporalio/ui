//  The function takes a decoded StackTraceQuery response as a string
//  It returns true if the response came from the JavaSDK and false otherwise
export const isFromJavaSDK = (stackTraceText) => {
    return /\w.java:\d/.test(stackTraceText); //contains '.java:' followed by a digit
};
