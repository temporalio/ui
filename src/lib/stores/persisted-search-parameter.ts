import { browser } from '$app/env';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { writable, get, type Writable } from 'svelte/store';

type SearchParameterValue = string | number | boolean | null;

const isBoolean = (value: SearchParameterValue): value is boolean => typeof value === 'boolean';
const isNumber = (value: SearchParameterValue): value is number => typeof value === 'number';

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

const saveToSearchParameters = (parameter: string, value: SearchParameterValue) => {
	if (browser) {
		const url = new URL(window?.location?.href);
		url.searchParams.set(parameter, String(value));

		goto(url.href, {
			replaceState: true,
			keepfocus: true,
			noscroll: true
		});
	}
};

const getFromLocalStorage = (parameter: string): string | undefined => {
	if (browser) {
		const value = window?.localStorage?.getItem(parameter);
		if (value) return value;
	}
};

const saveToLocalStorage = (parameter: string, value: SearchParameterValue) => {
	if (browser) {
		window?.localStorage?.setItem(parameter, String(value));
	}
};

const getValue = (parameter: string, defaultValue: SearchParameterValue): SearchParameterValue => {
	let value: string | undefined = undefined;

	let searchParameterValue = getFromSearchParameters(parameter);
	let localStorageValue = getFromLocalStorage(parameter);

	if (searchParameterValue !== undefined) {
		saveToLocalStorage(parameter, searchParameterValue);
		value = searchParameterValue;
	} else if (localStorageValue !== undefined) {
		saveToSearchParameters(parameter, localStorageValue);
		value = localStorageValue;
	}

	if (value !== undefined) {
		if (isBoolean(defaultValue)) return toBoolean(value, defaultValue);
		if (isNumber(defaultValue)) return toNumber(value);
	}

	return defaultValue;
};

const setValue = (parameter: string, value: SearchParameterValue) => {
	saveToLocalStorage(parameter, value);
	saveToSearchParameters(parameter, value);
};

export const searchParameter = (
	parameter: string,
	defaultValue: SearchParameterValue
): Writable<SearchParameterValue> => {
	const value = getValue(parameter, defaultValue);
	const store = writable(value);

	const set: typeof store.set = (value: SearchParameterValue) => {
		store.set(value);
		setValue(parameter, value);
	};

	const update: typeof store.update = (updater) => {
		store.update(updater);
		setValue(parameter, value);
	};

	return {
		subscribe: store.subscribe,
		set,
		update
	};
};
