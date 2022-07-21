import { browser } from '$app/env';
import { networkError } from '$lib/stores/error';
import { notifications as notificationStore } from '$lib/stores/notifications';
import { isNetworkError } from './is-network-error';
import { routeForLoginPage } from './route-for';

// This will eventually be expanded on.
export const handleError = (
  error: unknown,
  notifications = notificationStore,
  errors = networkError,
  isBrowser = browser,
): void => {
  if (isUnauthorized(error) && isBrowser) {
    window.location.assign(routeForLoginPage());
    return;
  }

  if (isForbidden(error) && isBrowser) {
    window.location.assign(routeForLoginPage());
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

const isUnauthorized = (error: unknown): error is NetworkError => {
  if (isNetworkError(error)) {
    return error.statusCode === 401;
  }

  return false;
};

const isForbidden = (error: unknown): error is NetworkError => {
  if (isNetworkError(error)) {
    return error.statusCode === 403;
  }

  return false;
};
