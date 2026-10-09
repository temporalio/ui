import { describe, expect, it } from 'vitest';

import { handleError } from './hooks.client';

const handle = (error: unknown) =>
  handleError({
    error,
    event: {} as never,
    status: 500,
    message: 'Internal Error',
  });

describe('handleError', () => {
  it('keeps the status code of a network error', () => {
    expect(
      handle({
        statusCode: 403,
        statusText: 'Forbidden',
        response: null,
        message: 'Request unauthorized.',
      }),
    ).toEqual({ message: 'Request unauthorized.', statusCode: 403 });
  });

  it('falls back to the status text when a network error has no message', () => {
    expect(
      handle({ statusCode: 403, statusText: 'Forbidden', response: null }),
    ).toEqual({ message: 'Forbidden', statusCode: 403 });
  });

  it('keeps the default message for other errors', () => {
    expect(handle(new Error('boom'))).toEqual({ message: 'Internal Error' });
  });
});
