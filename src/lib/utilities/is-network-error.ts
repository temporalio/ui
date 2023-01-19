import { hasKeys } from './has';

export function isNetworkError(
  error: unknown | NetworkError,
): error is NetworkError {
  if (!error) return false;
  return hasKeys(error, 'statusCode', 'statusText', 'response');
}
