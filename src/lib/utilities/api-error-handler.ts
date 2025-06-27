import { isNetworkError } from './is-network-error';

export interface ApiError extends Error {
  statusCode?: number;
  statusText?: string;
  userMessage: string;
  isRetryable: boolean;
  isTemporary: boolean;
}

export const createApiError = (
  error: unknown,
  operation: string = 'operation',
): ApiError => {
  const baseMessage = `Failed to ${operation}`;

  if (isNetworkError(error)) {
    return {
      ...error,
      name: 'ApiError',
      userMessage: getNetworkErrorMessage(error, operation),
      isRetryable: isRetryableError(error.statusCode),
      isTemporary: isTemporaryError(error.statusCode),
    } as ApiError;
  }

  if (error instanceof Error) {
    return {
      ...error,
      name: 'ApiError',
      userMessage: `${baseMessage}: ${error.message}`,
      isRetryable: false,
      isTemporary: false,
    } as ApiError;
  }

  const unknownError = new Error(`${baseMessage}: Unknown error`) as ApiError;
  unknownError.name = 'ApiError';
  unknownError.userMessage = `${baseMessage}: An unexpected error occurred`;
  unknownError.isRetryable = false;
  unknownError.isTemporary = false;

  return unknownError;
};

const getNetworkErrorMessage = (
  error: { statusCode: number; statusText: string },
  operation: string,
): string => {
  switch (error.statusCode) {
    case 400:
      return 'Invalid data provided. Please check your entries and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return `Permission denied. You may not have access to perform this ${operation}.`;
    case 404:
      return 'Resource not found. It may have been deleted or moved.';
    case 409:
      return 'Conflict detected. The resource may have been modified by another user.';
    case 422:
      return 'Invalid data format. Please check your entries and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error occurred. Please try again in a few moments.';
    default:
      return `Network error (${error.statusCode}): ${error.statusText}`;
  }
};

const isRetryableError = (statusCode?: number): boolean => {
  if (!statusCode) return false;
  return [408, 429, 500, 502, 503, 504].includes(statusCode);
};

const isTemporaryError = (statusCode?: number): boolean => {
  if (!statusCode) return false;
  return [429, 500, 502, 503, 504].includes(statusCode);
};
