import { BROWSER } from 'esm-env';

import { networkError } from '$lib/stores/error';
import { toaster } from '$lib/stores/toaster';
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
  errors = networkError,
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
    window.location.assign(routeForLoginPage());
  }

  // 403 (Forbidden) is an authorization failure, not a session failure.
  // Let it propagate to the caller's error UI instead of redirecting to login.

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

export const handleUnauthorizedError = (
  error: APIErrorResponse,
  isBrowser = BROWSER,
): void => {
  if (isUnauthorized(error) && isBrowser) {
    window.location.assign(routeForLoginPage());
    return;
  }
  // 403 (Forbidden) intentionally falls through with no redirect.
};

/**
 * @deprecated Use `handleUnauthorizedError`. 403 should not log the user out.
 */
export const handleUnauthorizedOrForbiddenError = handleUnauthorizedError;

export const isUnauthorized = (error: unknown): error is TemporalAPIError => {
  return hasStatusCode(error, 401);
};

export const isForbidden = (error: unknown): error is TemporalAPIError => {
  return hasStatusCode(error, 403);
};

export const isNotFound = (error: unknown): error is TemporalAPIError => {
  return hasStatusCode(error, 404);
};

export const isNotImplemented = (error: unknown): error is TemporalAPIError => {
  return hasStatusCode(error, 501);
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
