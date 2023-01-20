import { browser } from '$app/environment';

export const base64EncodeUnicode = (str) => {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
};

export const btoa = (str: string, isBrowser = browser): string => {
  if (!isBrowser) return str;
  return base64EncodeUnicode(str);
};
