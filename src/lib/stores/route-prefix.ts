import { get, writable } from 'svelte/store';

export const routePrefix = writable<string>('');

export const getRoutePrefix = (): string => get(routePrefix);
