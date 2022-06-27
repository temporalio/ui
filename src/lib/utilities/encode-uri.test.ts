import { describe, expect, it } from 'vitest';
import { encodeURIForSvelte, decodeURIForSvelte } from './encode-uri';

describe('encodeURIForSvelte', () => {
  it('should encode reserved URI characters, \\ and %', () => {
    const path = encodeURIForSvelte(',./;\'[]-=<>?:"{}|_+!@#$%^&*()`~)');
    expect(path).toEqual(
      '%2C.%2F;\'[]-%3D<>%3F%3A"{}|_%2B!%40%23%24%25^%26*()`~)',
    );
  });
});

describe('decodeURIForSvelte', () => {
  it('should decode reserved URI characters, \\ and %', () => {
    const path = decodeURIForSvelte(
      '%2C.%2F;\'[]-%3D<>%3F%3A"{}|_%2B!%40%23%24%25^%26*()`~)',
    );
    expect(path).toEqual(',./;\'[]-=<>?:"{}|_+!@#$%^&*()`~)');
  });
});
