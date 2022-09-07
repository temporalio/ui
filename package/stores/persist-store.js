import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { isFunction } from '../utilities/is-function';
export function persistStore(name, initialValue = null) {
    var _a, _b;
    let initialStoreValue = isFunction(initialValue)
        ? initialValue()
        : initialValue;
    if (browser) {
        try {
            if ((_a = window === null || window === void 0 ? void 0 : window.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(name)) {
                initialStoreValue = JSON.parse((_b = window === null || window === void 0 ? void 0 : window.localStorage) === null || _b === void 0 ? void 0 : _b.getItem(name));
            }
        }
        catch (_err) {
            initialStoreValue = null;
        }
    }
    const { subscribe, set } = writable(initialStoreValue);
    return {
        subscribe,
        set: (x) => {
            var _a, _b;
            if (browser) {
                if (x === null) {
                    (_a = window === null || window === void 0 ? void 0 : window.localStorage) === null || _a === void 0 ? void 0 : _a.removeItem(name);
                }
                else {
                    (_b = window === null || window === void 0 ? void 0 : window.localStorage) === null || _b === void 0 ? void 0 : _b.setItem(name, JSON.stringify(x));
                }
            }
            set(x);
        },
    };
}
