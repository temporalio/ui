import { BROWSER } from 'esm-env';

import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';

function createAtobStringForUnicode(str: string) {
  return window
    .atob(str)
    .split('')
    .map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    })
    .join('');
}

export function base64DecodeUnicode(str: string): string {
  return decodeURIComponent(createAtobStringForUnicode(str));
}

function base64DecodeUnicodeFallback(str: string): string {
  try {
    return stringifyWithBigInt(parseWithBigInt(window.atob(str)));
  } catch {
    return str;
  }
}

export const atob = (str: string, isBrowser = BROWSER): string => {
  if (!isBrowser) return str;
  try {
    return base64DecodeUnicode(str);
  } catch {
    return base64DecodeUnicodeFallback(str);
  }
};
