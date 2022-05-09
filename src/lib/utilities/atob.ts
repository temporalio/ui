import { browser } from '$app/env';

// decode base64 to unicode
function atou(str: string) {
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

export const atob = browser ? atou : (str: string) => str;
