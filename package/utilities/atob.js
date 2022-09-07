import { browser } from '$app/env';
export function base64DecodeUnicode(str) {
    return decodeURIComponent(window
        .atob(str)
        .split('')
        .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    })
        .join(''));
}
export const atob = (str, isBrowser = browser) => {
    if (!isBrowser)
        return str;
    return base64DecodeUnicode(str);
};
