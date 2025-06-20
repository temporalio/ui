import { toaster } from '$lib/stores/toaster';

import type { OnErrorParams } from '../types';

export function formatErrorMessage(event: OnErrorParams): string {
  return (
    event.message ||
    event.result?.error?.message ||
    'An unexpected error occurred. Please try again.'
  );
}

export function defaultErrorHandler(event: OnErrorParams): void {
  toaster.push({
    message: formatErrorMessage(event),
    variant: 'error',
  });
}
