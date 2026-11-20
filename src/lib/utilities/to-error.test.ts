import { describe, expect, it } from 'vitest';

import { toError } from './to-error';

describe('toError', () => {
  it('returns an Error unchanged', () => {
    const error = new Error('broken');
    expect(toError(error)).toBe(error);
  });

  it('returns a NetworkError unchanged', () => {
    const error = { statusCode: 500, statusText: 'Error', response: {} };
    expect(toError(error)).toBe(error);
  });

  it('wraps an object with a message in an Error', () => {
    const error = toError({ message: 'broken' });
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('broken');
  });

  it('wraps anything else in an Error with a fallback message', () => {
    const error = toError('broken');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).not.toBe('');
  });
});
