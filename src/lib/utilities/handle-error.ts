import { networkError } from '$lib/stores/error';
import { notifications } from '../stores/notifications';
import { isNetworkError } from './is-network-error';

// This will eventually be expanded on.
export const handleError = (error: unknown): void => {
  if (isForbidden(error)) {
    notifications.add('error', `${error.statusCode} ${error.statusText}`);
    return;
  }

  if (isNetworkError(error)) {
    notifications.add('error', `${error.statusCode} ${error.statusText}`);
    // Re-throw error to prevent other code from attempting to render
    networkError.set(error);
    throw error;
  }

  if (typeof error === 'string') {
    notifications.add('error', error);
  }

  if (error instanceof Error) {
    notifications.add('error', error.message);
  }
};

const isForbidden = (error: unknown): error is NetworkError => {
  if (isNetworkError(error)) {
    return error.statusCode === 403 || error.statusCode === 401;
  }

  return false;
};
