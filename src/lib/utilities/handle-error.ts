import { notifications } from '../stores/notifications';

// This will eventually be expanded on.
export const handleError = (error: unknown): void => {
  console.error(error);

  if (typeof error === 'string') {
    notifications.add('error', error);
  }

  if (error instanceof Error) {
    notifications.add('error', error.message);
  }
};
