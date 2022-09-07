import { browser } from '$app/env';
import { goto as navigateTo } from '$app/navigation';
const gotoOptions = {
    replaceState: true,
    keepfocus: true,
    noscroll: true,
};
export const updateQueryParameters = async ({ parameter, value, url, goto = navigateTo, allowEmpty = false, }) => {
    const next = String(value);
    if (value) {
        url.searchParams.set(parameter, next);
    }
    else if (allowEmpty) {
        url.searchParams.set(parameter, '');
    }
    else {
        url.searchParams.delete(parameter);
    }
    if (browser && url.href !== window.location.href) {
        goto(addHashToURL(url), gotoOptions);
    }
    return value;
};
export const addHashToURL = (url) => {
    url.hash = '#';
    return String(url);
};
