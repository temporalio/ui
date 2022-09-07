import type { Writable } from 'svelte/store';
export declare const delay = 300;
export declare const withLoading: (loading: Writable<boolean>, updating: Writable<boolean>, fn: () => Promise<void>) => Promise<void>;
