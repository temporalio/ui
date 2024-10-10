import { describe, expect, it } from 'vitest';

import { decodeURIForSvelte, encodeURIForSvelte } from './encode-uri';

describe('encodeURIForSvelte', () => {
  it('should encode reserved URI characters, \\ and %', () => {
    const path = encodeURIForSvelte('Test\\_With@%Many!!,Char/acters');
    expect(path).toEqual('Test%5C_With%40%25Many!!%2CChar%2Facters');
  });

  it('should encode reserved URI characters : # &', () => {
    const path = encodeURIForSvelte('::Test::With##Many&&Characters::');
    expect(path).toEqual(
      '%3A%3ATest%3A%3AWith%23%23Many%26%26Characters%3A%3A',
    );
  });

  it('should encode spaces', () => {
    const path = encodeURIForSvelte(' This is a test ');
    expect(path).toEqual('%20This%20is%20a%20test%20');
  });

  it('should encode already encoded characters', () => {
    const path = encodeURIForSvelte('Workflow%25ID%24');
    expect(path).toEqual('Workflow%2525ID%2524');
  });
});

describe('decodeURIForSvelte', () => {
  it('should decode reserved URI characters, \\ and %', () => {
    const path = decodeURIForSvelte('Test%5C_With%40%25Many!!%2CChar%2Facters');
    expect(path).toEqual('Test\\_With@%Many!!,Char/acters');
  });

  it('should decode reserved URI characters : # &', () => {
    const path = decodeURIForSvelte(
      '%3A%3ATest%3A%3AWith%23%23Many%26%26Characters%3A%3A',
    );
    expect(path).toEqual('::Test::With##Many&&Characters::');
  });

  it('should decode spaces', () => {
    const path = decodeURIForSvelte('%20This%20is%20a%20test%20');
    expect(path).toEqual(' This is a test ');
  });

  it('should decoded already encoded characters', () => {
    const path = decodeURIForSvelte('Workflow%2525ID%2524');
    expect(path).toEqual('Workflow%25ID%24');
  });
});
