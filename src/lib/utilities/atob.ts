import { browser } from '$app/env';

export function base64DecodeUnicode(str: string) {
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

export const atob = browser ? base64DecodeUnicode : (str: string) => str;
