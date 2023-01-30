import { writable } from 'svelte/store';
import type { GetClusterInfoResponse } from '$types';

export const cluster = writable<GetClusterInfoResponse>({});
