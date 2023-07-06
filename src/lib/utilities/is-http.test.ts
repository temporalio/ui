import { describe, expect, it } from 'vitest';

import { validateHttp, validateHttpOrHttps, validateHttps } from './is-http';

describe('validateHttps', () => {
  it('Should return true with valid https endpoint', () => {
    const endpoint = 'https://test.com';
    expect(validateHttps(endpoint)).toBe(true);
  });
  it('Should return false with valid http endpoint', () => {
    const endpoint = 'http://test.com';
    expect(validateHttps(endpoint)).toBe(false);
  });
  it('Should return false with invalid http endpoint', () => {
    const endpoint = 'test.com';
    expect(validateHttps(endpoint)).toBe(false);
  });
  it('Should return false with invalid https endpoint', () => {
    const endpoint = 'test.com.https://testagain.com';
    expect(validateHttps(endpoint)).toBe(false);
  });
});

describe('validateHttp', () => {
  it('Should return true with valid http endpoint', () => {
    const endpoint = 'http://test.com';
    expect(validateHttp(endpoint)).toBe(true);
  });
  it('Should return false with valid https endpoint', () => {
    const endpoint = 'https://test.com';
    expect(validateHttp(endpoint)).toBe(false);
  });
  it('Should return false with invalid http endpoint', () => {
    const endpoint = 'test.com';
    expect(validateHttp(endpoint)).toBe(false);
  });
  it('Should return false with invalid http endpoint', () => {
    const endpoint = 'test.com.http://testagain.com';
    expect(validateHttp(endpoint)).toBe(false);
  });
});

describe('validateHttpOrHttps', () => {
  it('Should return true with valid http endpoint', () => {
    const endpoint = 'http://test.com';
    expect(validateHttp(endpoint)).toBe(true);
  });
  it('Should return true with valid https endpoint', () => {
    const endpoint = 'https://test.com';
    expect(validateHttpOrHttps(endpoint)).toBe(true);
  });
  it('Should return false with invalid http endpoint', () => {
    const endpoint = 'test.com';
    expect(validateHttpOrHttps(endpoint)).toBe(false);
  });
  it('Should return false with invalid http endpoint', () => {
    const endpoint = 'test.com.http://testagain.com';
    expect(validateHttpOrHttps(endpoint)).toBe(false);
  });
});
