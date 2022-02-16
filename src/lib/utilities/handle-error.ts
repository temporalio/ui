import { networkError } from '$lib/stores/error';
import { notifications } from '../stores/notifications';
import { isNetworkError } from './is-network-error';

// This will eventually be expanded on.
export const handleError = (error: unknown): void => {
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
