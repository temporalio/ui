import { translate } from '$lib/i18n/translate';
import { has } from '$lib/utilities/has';
import { isNetworkError } from '$lib/utilities/is-network-error';

export function getErrorMessage(error: unknown): string {
  const message =
    (has(error, 'message') && typeof error.message === 'string'
      ? error.message.trim()
      : '') || translate('common.unknown-error');

  const statusCode = isNetworkError(error) ? error.statusCode : undefined;

  if (statusCode) {
    return `${statusCode}: ${message}`;
  }

  return message;
}
