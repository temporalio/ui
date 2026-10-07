import { describe, expect, it } from 'vitest';

import { getErrorKind } from './error-presentation';

describe('getErrorKind', () => {
  it.each([
    [400, 'bad-request'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [429, 'rate-limited'],
    [500, 'server'],
    [501, 'not-implemented'],
    [502, 'unavailable'],
    [503, 'unavailable'],
    [504, 'unavailable'],
    [507, 'server'],
    [409, 'unknown'],
    [undefined, 'unknown'],
  ])('maps %s to %s', (status, kind) => {
    expect(getErrorKind(status)).toBe(kind);
  });
});
