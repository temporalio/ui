import type { NetworkError } from 'src/more-global';
import { writable } from 'svelte/store';

export const networkError = writable<NetworkError | null>(null);
