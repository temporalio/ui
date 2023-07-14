import { writable } from 'svelte/store';

import type { GetClusterInfoResponse } from '$lib/types';

export const cluster = writable<GetClusterInfoResponse>({});
