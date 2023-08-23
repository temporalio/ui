import { writable } from 'svelte/store';

import type { NetworkError } from '$lib/types/global';

export const networkError = writable<NetworkError | null>(null);
