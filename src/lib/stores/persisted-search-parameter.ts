import { get, Writable, writable } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { page } from '$app/stores';

type SearchParameterValue = string | number | boolean | null;

const isBoolean = (value: SearchParameterValue): value is boolean =>
  typeof value === 'boolean';
const isNumber = (value: SearchParameterValue): value is number =>
  typeof value === 'number';

const toNumber = (value: string): number => parseInt(value);
const toBoolean = (value: string, defaultValue: boolean): boolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

const getFromSearchParameters = (parameter: string): string | undefined => {
  const value = get(page).url.searchParams.get(parameter);
  if (value) return value;
};

const saveToSearchParameters = (
  parameter: string,
  value: SearchParameterValue,
) => {
  if (BROWSER) {
    const url = new URL(window?.location?.href);
    url.searchParams.set(parameter, String(value));

    window?.history.replaceState(null, '', url);
  }
};

const getFromLocalStorage = (
  parameter: string,
  persist: boolean,
): string | undefined => {
  if (BROWSER && persist) {
    const value = window?.localStorage?.getItem(parameter);
    if (value) return value;
  }
};

const saveToLocalStorage = (
  parameter: string,
  value: SearchParameterValue,
  persist: boolean,
) => {
  if (BROWSER && persist) {
    window?.localStorage?.setItem(parameter, String(value));
  }
};

const getValue = (
  parameter: string,
  defaultValue: SearchParameterValue,
  persist: boolean,
): SearchParameterValue => {
  let value: string | undefined = undefined;

  const searchParameterValue = getFromSearchParameters(parameter);
  const localStorageValue = getFromLocalStorage(parameter, persist);

  if (searchParameterValue !== undefined) {
    saveToLocalStorage(parameter, searchParameterValue, persist);
    value = searchParameterValue;
  } else if (localStorageValue !== undefined) {
    saveToSearchParameters(parameter, localStorageValue);
    value = localStorageValue;
  }

  if (value !== undefined) {
    if (isBoolean(defaultValue)) return toBoolean(value, defaultValue);
    if (isNumber(defaultValue)) return toNumber(value);
    return value;
  }

  setValue(parameter, value, persist);
  return defaultValue;
};

const setValue = (
  parameter: string,
  value: SearchParameterValue,
  persist: boolean,
) => {
  saveToLocalStorage(parameter, value, persist);
  saveToSearchParameters(parameter, value);
};

export const searchParameter = (
  parameter: string,
  defaultValue: SearchParameterValue,
  persist = true,
): Writable<SearchParameterValue> => {
  const value = getValue(parameter, defaultValue, persist);
  const store = writable(value);

  const set: typeof store.set = (value: SearchParameterValue) => {
    store.set(value);
    setValue(parameter, value, persist);
  };

  const update: typeof store.update = (updater) => {
    store.update(updater);
    setValue(parameter, value, persist);
  };

  return {
    subscribe: store.subscribe,
    set,
    update,
  };
};
