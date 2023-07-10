import { describe, expect, it } from 'vitest';

import { toURL } from './to-url';

describe('toURL', () => {
  it('should take a string for the URL and return it', () => {
    expect(toURL('/workflows')).toBe('/workflows');
  });

  it('should turn the query params into a query string', () => {
    const params = new URLSearchParams({ a: 'hello' });
    expect(toURL('/workflows', params)).toBe('/workflows?a=hello');
  });

  it('should turn an object into a query string', () => {
    const params = { a: 'hello' };
    expect(toURL('/workflows', params)).toBe('/workflows?a=hello');
  });
});
