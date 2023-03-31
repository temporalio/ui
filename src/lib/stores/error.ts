import type { NetworkError } from 'src/types/global';
import { writable } from 'svelte/store';

export const networkError = writable<NetworkError | null>(null);
