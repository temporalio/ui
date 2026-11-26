import { describe, expect, test } from 'vitest';

import { getErrorMessage } from './error-message';

const networkError = (statusCode: number, message: string) => ({
  statusCode,
  statusText: '',
  response: {},
  message,
});

describe('getErrorMessage', () => {
  test.each([
    {
      name: 'Error',
      error: new Error('Failed to fetch'),
      expected: 'Failed to fetch',
    },
    {
      name: 'object with message',
      error: { message: 'API error' },
      expected: 'API error',
    },
    {
      name: 'padded message',
      error: { message: '  API error  ' },
      expected: 'API error',
    },
    {
      name: 'network error',
      error: networkError(403, 'Request unauthorized.'),
      expected: '403: Request unauthorized.',
    },
    {
      name: 'network error with empty message',
      error: networkError(502, ''),
      expected: '502: An unknown error occurred.',
    },
    {
      name: 'empty message',
      error: { message: '' },
      expected: 'An unknown error occurred.',
    },
    {
      name: 'whitespace message',
      error: { message: ' \t ' },
      expected: 'An unknown error occurred.',
    },
    {
      name: 'non-string message',
      error: { message: 42 },
      expected: 'An unknown error occurred.',
    },
    {
      name: 'string',
      error: 'String error',
      expected: 'An unknown error occurred.',
    },
    { name: 'null', error: null, expected: 'An unknown error occurred.' },
    {
      name: 'undefined',
      error: undefined,
      expected: 'An unknown error occurred.',
    },
  ])('returns $expected for $name', ({ error, expected }) => {
    expect(getErrorMessage(error)).toBe(expected);
  });
});
