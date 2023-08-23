/*
  The function takes a decoded 'data' value from a StackTraceQuery response as a string
  It returns an array of JSONs that contain file paths found in the stack trace
      if the stack trace originates from the Go SDK
  It returns undefined otherwise
 */
import { isFromGoSDK } from './is-from-go-sdk';
import { parseWithBigInt } from '../parse-with-big-int';

export const getFilePathsFromGoStackTrace = (
  stackTraceText: string,
): { filePath: string; codeLine: number; character: number }[] => {
  const pattern = new RegExp(/(\w:|\/)(.)+.go:([\d])+/g);
  if (isFromGoSDK(stackTraceText)) {
    const paths: { filePath: string; codeLine: number; character: number }[] =
      [];
    const windowsPathFlag = /\w:\//.test(stackTraceText);
    const macthingLines = stackTraceText.match(pattern);
    if (macthingLines != null) {
      macthingLines.forEach((line) => {
        const splitLine = line.split(':');
        if (windowsPathFlag) {
          splitLine[0] = (splitLine[0] + ':' + splitLine[1]).replace(
            /\//g,
            '\\',
          ); //Fixes backwards-placed slashes in win paths
          splitLine.splice(1, 1);
        }
        const [pathValue, codeLineValue] = splitLine;
        const jsonString = `{"filePath": "", "codeLine": ${codeLineValue}, "character": null}`;
        const jsonObj = parseWithBigInt(jsonString);
        jsonObj.filePath = pathValue; //To avoid issues with parsing windows paths to JSON
        paths.push(jsonObj);
      });
    }

    return paths;
  } else return undefined;
};
