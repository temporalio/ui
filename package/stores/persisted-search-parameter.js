import { browser } from '$app/env';
import { page } from '$app/stores';
import { writable, get } from 'svelte/store';
const isBoolean = (value) => typeof value === 'boolean';
const isNumber = (value) => typeof value === 'number';
const toNumber = (value) => parseInt(value);
const toBoolean = (value, defaultValue) => {
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    return defaultValue;
};
const getFromSearchParameters = (parameter) => {
    const value = get(page).url.searchParams.get(parameter);
    if (value)
        return value;
};
const saveToSearchParameters = (parameter, value) => {
    var _a;
    if (browser) {
        const url = new URL((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.href);
        url.searchParams.set(parameter, String(value));
        window === null || window === void 0 ? void 0 : window.history.replaceState(null, '', url);
    }
};
const getFromLocalStorage = (parameter, persist) => {
    var _a;
    if (browser && persist) {
        const value = (_a = window === null || window === void 0 ? void 0 : window.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(parameter);
        if (value)
            return value;
    }
};
const saveToLocalStorage = (parameter, value, persist) => {
    var _a;
    if (browser && persist) {
        (_a = window === null || window === void 0 ? void 0 : window.localStorage) === null || _a === void 0 ? void 0 : _a.setItem(parameter, String(value));
    }
};
const getValue = (parameter, defaultValue, persist) => {
    let value = undefined;
    const searchParameterValue = getFromSearchParameters(parameter);
    const localStorageValue = getFromLocalStorage(parameter, persist);
    if (searchParameterValue !== undefined) {
        saveToLocalStorage(parameter, searchParameterValue, persist);
        value = searchParameterValue;
    }
    else if (localStorageValue !== undefined) {
        saveToSearchParameters(parameter, localStorageValue);
        value = localStorageValue;
    }
    if (value !== undefined) {
        if (isBoolean(defaultValue))
            return toBoolean(value, defaultValue);
        if (isNumber(defaultValue))
            return toNumber(value);
        return value;
    }
    setValue(parameter, value, persist);
    return defaultValue;
};
const setValue = (parameter, value, persist) => {
    saveToLocalStorage(parameter, value, persist);
    saveToSearchParameters(parameter, value);
};
export const searchParameter = (parameter, defaultValue, persist = true) => {
    const value = getValue(parameter, defaultValue, persist);
    const store = writable(value);
    const set = (value) => {
        store.set(value);
        setValue(parameter, value, persist);
    };
    const update = (updater) => {
        store.update(updater);
        setValue(parameter, value, persist);
    };
    return {
        subscribe: store.subscribe,
        set,
        update,
    };
};
