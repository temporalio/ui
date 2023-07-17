/*
  The function takes a decoded 'data' value from a StackTraceQuery response as a string
  It returns an array of JSONs that contain file paths found in the stack trace
        if the stack trace originates from the TypeScript SDK
  It returns undefined otherwise
 */
import { isFromTypeScriptSDK } from './is-from-typescript-sdk';
import { parseWithBigInt } from '../parse-with-big-int';

export const getFilePathsFromTypeScriptStackTrace = (
  stackTraceText: string,
): { filePath: string; codeLine: number; character: number }[] => {
  const pattern = new RegExp(/\((\w:|\/)(.)+.ts:([\d])+:([\d])+\)/g);
  if (isFromTypeScriptSDK(stackTraceText)) {
    const paths: { filePath: string; codeLine: number; character: number }[] =
      [];
    const windowsPathFlag = /\(\w:\\/.test(stackTraceText);
    const macthingLines = stackTraceText.match(pattern);
    if (macthingLines != null) {
      macthingLines.forEach((line) => {
        const splitLine = line.slice(1, -1).split(':');
        if (windowsPathFlag) {
          splitLine[0] = splitLine[0] + ':' + splitLine[1];
          splitLine.splice(1, 1);
        }
        const [pathValue, codeLineValue, characterValue] = splitLine;
        const jsonString = `{"filePath": "", "codeLine": ${codeLineValue}, "character": ${characterValue}}`;
        const jsonObj = parseWithBigInt(jsonString);
        jsonObj.filePath = pathValue; //To avoid issues with parsing windows paths to JSON
        paths.push(jsonObj);
      });
    }
    return paths;
  } else return undefined;
};
