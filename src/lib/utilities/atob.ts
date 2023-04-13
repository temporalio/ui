import { BROWSER } from 'esm-env';

export function base64DecodeUnicode(str: string): string {
  return decodeURIComponent(
    window
      .atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

export const atob = (str: string, isBrowser = BROWSER): string => {
  if (!isBrowser) return str;
  return base64DecodeUnicode(str);
};
