import { writable } from 'svelte/store';
import type { NetworkError } from 'src/types/global';

export const networkError = writable<NetworkError | null>(null);
