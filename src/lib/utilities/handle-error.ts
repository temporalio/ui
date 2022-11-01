import { browser } from '$app/env';
import { networkError } from '$lib/stores/error';
import { notifications as notificationStore } from '$lib/stores/notifications';
import { isNetworkError } from './is-network-error';
import type { APIErrorResponse } from './request-from-api';
import { routeForLoginPage } from './route-for';

// This will eventually be expanded on.
export const handleError = (
  error: any,
  notifications = notificationStore,
  errors = networkError,
  isBrowser = browser,
): void => {
  if (isUnauthorized(error) && isBrowser) {
    window.location.assign(routeForLoginPage(error?.message));
    return;
  }

  if (isForbidden(error) && isBrowser) {
    window.location.assign(routeForLoginPage(error?.message));
    return;
  }

  if (isNetworkError(error)) {
    notifications.add('error', `${error.statusCode} ${error.statusText}`);
    // Re-throw error to prevent other code from attempting to render
    errors.set(error);
    throw error;
  }

  if (typeof error === 'string') {
    notifications.add('error', error);
  }

  if (error instanceof Error) {
    notifications.add('error', error.message);
  }
};

export const handleUnauthorizedOrForbiddenError = (
  error: APIErrorResponse,
  isBrowser = browser,
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

export const isUnauthorized = (error: any): boolean => {
  return error?.statusCode === 401 || error?.status === 401;
};

export const isForbidden = (error: any): boolean => {
  return error?.statusCode === 403 || error?.status === 403;
};
