import { dev } from '$app/env';

export const handleError = (error: unknown) => {
  if (dev) {
    console.error(error);
  }
};
