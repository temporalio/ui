//  The function takes a decoded StackTraceQuery response as a string
//  and returns the name of the SDK the response came from

import { isFromGoSDK } from './is-from-go-sdk';
import { isFromJavaSDK } from './is-from-java-sdk';
import { isFromTypeScriptSDK } from './is-from-typescript-sdk';

export const getSDKOrigin = (stackTraceText: string): string => {
  if (isFromTypeScriptSDK(stackTraceText)) return 'typescript';
  else if (isFromGoSDK(stackTraceText)) return 'go';
  else if (isFromJavaSDK(stackTraceText)) return 'java';
  else return null;
};
