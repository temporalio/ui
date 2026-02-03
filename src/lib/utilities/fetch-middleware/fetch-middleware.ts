import { getContext, setContext } from 'svelte';

import type { Interceptor } from './types.js';

const FETCH_MIDDLEWARE_KEY = {};

export function setFetchMiddleware(interceptors: Interceptor[]): void {
  setContext(FETCH_MIDDLEWARE_KEY, interceptors);
}

export function getFetchMiddleware(): Interceptor[] | undefined {
  return getContext(FETCH_MIDDLEWARE_KEY) as Interceptor[] | undefined;
}
