import { has } from './has';
import type { NetworkError } from 'src/types/global';

export function isNetworkError(
  error: unknown | NetworkError,
): error is NetworkError {
  if (!error) return false;
  return has(error, 'statusCode', 'statusText', 'response');
}
