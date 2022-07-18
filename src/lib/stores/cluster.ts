import { writable } from 'svelte/store';
import type { GetClusterInfoResponse } from '$lib/extra-types';

export const cluster = writable<GetClusterInfoResponse>({});
