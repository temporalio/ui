import { writable } from 'svelte/store';

export const currentProps = writable<{ [index: string]: unknown }>({});
