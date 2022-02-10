import { networkError } from '$lib/stores/error-store';
import { notifications } from '../stores/notifications';
import type { NetworkError } from './request-from-api';

export function isNetworkError(
  error: unknown | NetworkError,
): error is NetworkError {
  const networkErr = error as NetworkError;
  return (
    networkErr?.statusCode !== undefined &&
    networkErr?.statusText !== undefined &&
    networkErr?.response !== undefined
  );
}

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
