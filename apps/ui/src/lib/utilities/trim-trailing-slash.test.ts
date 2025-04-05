import { describe, expect, it } from 'vitest';

import { trimTrailingSlash } from './trim-trailing-slash';

describe('trimTrailingSlash', () => {
  it('should remove trailing slash from a string', () => {
    expect(trimTrailingSlash('http://cats.meow/')).toEqual('http://cats.meow');
  });
  it('should return original string if no trailing slash', () => {
    expect(trimTrailingSlash('http://cats.meow')).toEqual('http://cats.meow');
  });
});
