import type { NetworkError } from '$lib/types/global';

import { getErrorMessage } from './error-message';
import { isNetworkError } from './is-network-error';

export const toError = (error: unknown): Error | NetworkError =>
  error instanceof Error || isNetworkError(error)
    ? error
    : new Error(getErrorMessage(error));
