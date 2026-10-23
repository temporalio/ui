import { translate } from '$lib/i18n/translate';
import { isNetworkError } from '$lib/utilities/is-network-error';

export function getErrorMessage(error: unknown): string {
  const message =
    (typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message.trim()
      : '') || translate('common.unknown-error');

  const statusCode = isNetworkError(error) ? error.statusCode : undefined;

  if (statusCode) {
    return `${statusCode}: ${message}`;
  }

  return message;
}
