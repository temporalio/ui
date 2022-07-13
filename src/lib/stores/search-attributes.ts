import type { GetSearchAttributesResponse } from '$types';
import { writable } from 'svelte/store';

export const searchAttributes = writable<GetSearchAttributesResponse['keys']>(
  {},
);
