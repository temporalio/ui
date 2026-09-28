import type { I18nKey } from '$lib/i18n';
import { translate } from '$lib/i18n/translate';
import { requestFromAPI } from '$lib/utilities/request-from-api';

export type TypeSafeRequestErrorKind = 'rate-limited' | 'forbidden' | 'server';

export class TypeSafeRequestError extends Error {
  statusCode?: number;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    statusCode?: number,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'TypeSafeRequestError';
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get kind(): TypeSafeRequestErrorKind {
    if (this.statusCode === 429) return 'rate-limited';
    if (this.statusCode === 401 || this.statusCode === 403) return 'forbidden';
    return 'server';
  }
}

export const parseRetryAfter = (
  value: string | null | undefined,
  now = new Date(),
): number | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    const seconds = parseInt(trimmed, 10);
    return seconds > 0 ? seconds : undefined;
  }

  const date = new Date(trimmed).getTime();
  if (Number.isNaN(date)) return undefined;

  const seconds = Math.ceil((date - now.getTime()) / 1000);
  return seconds > 0 ? seconds : undefined;
};

export type TypeSafeErrorMessageKeys = {
  rateLimited: I18nKey;
  rateLimitedRetry: I18nKey;
  forbidden: I18nKey;
  generic: I18nKey;
};

export const toTypeSafeErrorMessage = (
  error: unknown,
  keys: TypeSafeErrorMessageKeys,
): string => {
  if (!(error instanceof TypeSafeRequestError)) {
    return translate(keys.generic);
  }

  if (error.kind === 'rate-limited') {
    return error.retryAfterSeconds
      ? translate(keys.rateLimitedRetry, { count: error.retryAfterSeconds })
      : translate(keys.rateLimited);
  }

  if (error.kind === 'forbidden') {
    return translate(keys.forbidden);
  }

  return error.message || translate(keys.generic);
};

export const postTypeSafeRequest = async <T>(
  route: string,
  body: unknown,
  request = fetch,
): Promise<T | undefined> => {
  try {
    return await requestFromAPI<T>(route, {
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      notifyOnError: false,
      request,
    });
  } catch (error: unknown) {
    const { message, statusCode, response } = (error ?? {}) as {
      message?: string;
      statusCode?: number;
      response?: Response;
    };
    throw new TypeSafeRequestError(
      message ?? '',
      statusCode,
      statusCode === 429
        ? parseRetryAfter(response?.headers?.get('Retry-After'))
        : undefined,
    );
  }
};
