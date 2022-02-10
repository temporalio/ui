import type { NetworkError } from '$lib/utilities/request-from-api';
import { writable } from 'svelte/store';

export const networkError = writable<NetworkError | null>(null);
