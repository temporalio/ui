import { writable } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { toaster } from '$lib/holocene/toaster/toaster.svelte';
import type { NetworkError } from '$lib/types/global';

import { has } from './has';
import { isNetworkError } from './is-network-error';
import type { APIErrorResponse, TemporalAPIError } from './request-from-api';
import { routeForLoginPage } from './route-for';

interface NetworkErrorWithReport extends NetworkError {
  report?: boolean;
}

export const handleError = (
  error: unknown,
  toasts = toaster,
  errors = writable(null),
  isBrowser = BROWSER,
): void => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return;
  }

  if (typeof error === 'string') {
    toasts.push({ variant: 'error', message: error });
  } else {
    (error as NetworkErrorWithReport).report = false;
  }

  if (error instanceof Error) {
    toasts.push({ variant: 'error', message: error.message });
  }

  if (isUnauthorized(error) && isBrowser) {
    window.location.assign(routeForLoginPage(error?.message));
  }

  if (isForbidden(error) && isBrowser) {
    window.location.assign(routeForLoginPage(error?.message));
  }

  if (isNetworkError(error)) {
    toasts.push({
      variant: 'error',
      message: `${error.statusCode} ${error.statusText}`,
    });
    // Re-throw error to prevent other code from attempting to render
    errors.set(error);
  }

  throw error;
};

export const handleUnauthorizedOrForbiddenError = (
  error: APIErrorResponse,
  isBrowser = BROWSER,
): void => {
  const msg = `${error?.status} ${error?.body?.message}`;

  if (isUnauthorized(error) && isBrowser) {
    window.location.assign(routeForLoginPage(msg));
    return;
  }

  if (isForbidden(error) && isBrowser) {
    window.location.assign(routeForLoginPage(msg));
    return;
  }
};

export const isUnauthorized = (error: unknown): error is TemporalAPIError => {
  return hasStatusCode(error, 401);
};

export const isForbidden = (error: unknown): error is TemporalAPIError => {
  return hasStatusCode(error, 403);
};

const hasStatusCode = (
  error: unknown,
  statusCode: number | string,
): error is TemporalAPIError => {
  if (has(error, 'statusCode')) {
    return error.statusCode === statusCode;
  }

  if (has(error, 'status')) {
    return error.status === statusCode;
  }

  return false;
};
