import { BROWSER } from 'esm-env';

export const base64EncodeUnicode = (str: string) => {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
};

export const btoa = (str: string, isBrowser = BROWSER): string => {
  if (!isBrowser) return str;
  return base64EncodeUnicode(str);
};
