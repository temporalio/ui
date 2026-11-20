import { describe, expect, it } from 'vitest';

import { toURL } from './to-url';

describe('toURL', () => {
  it('should take a string for the URL and return it', () => {
    expect(toURL('/workflows')).toBe('/workflows');
  });

  it('should take a string and hash for the URL and return it', () => {
    expect(toURL('/workflows', undefined, '123')).toBe('/workflows#123');
  });

  it('should turn the query params into a query string', () => {
    const params = new URLSearchParams({ a: 'hello' });
    expect(toURL('/workflows', params)).toBe('/workflows?a=hello');
  });

  it('should turn an object into a query string', () => {
    const params = { a: 'hello' };
    expect(toURL('/workflows', params)).toBe('/workflows?a=hello');
  });

  it('should turn an object into a query string and include it with a hash', () => {
    const params = { a: 'hello' };
    expect(toURL('/workflows', params, '123')).toBe('/workflows?a=hello#123');
  });

  it('should turn the query params into a query string with a hash', () => {
    const params = new URLSearchParams({ a: 'hello' });
    expect(toURL('/workflows', params, '1')).toBe('/workflows?a=hello#1');
  });

  it('should merge params into a query the URL already has', () => {
    expect(toURL('/workflows?a=hello', { b: 'world' })).toBe(
      '/workflows?a=hello&b=world',
    );
  });

  it('should let params override keys the URL already has', () => {
    const params = new URLSearchParams({ a: 'goodbye' });
    expect(toURL('/workflows?a=hello&b=world', params)).toBe(
      '/workflows?a=goodbye&b=world',
    );
  });

  it('should keep every value of a repeated key in params', () => {
    const params = new URLSearchParams([
      ['a', 'goodbye'],
      ['a', 'again'],
    ]);
    expect(toURL('/workflows?a=hello&b=world', params)).toBe(
      '/workflows?a=goodbye&b=world&a=again',
    );
  });

  it('should keep an existing query when no params are given', () => {
    expect(toURL('/workflows?a=hello')).toBe('/workflows?a=hello');
  });

  it('should keep an existing hash unless a new one is given', () => {
    expect(toURL('/workflows?a=hello#1', { b: 'world' })).toBe(
      '/workflows?a=hello&b=world#1',
    );
    expect(toURL('/workflows#1', undefined, '2')).toBe('/workflows#2');
  });

  it('should not normalize the path', () => {
    expect(toURL('/workflows/%2E%2E/run', { a: 'hello' })).toBe(
      '/workflows/%2E%2E/run?a=hello',
    );
  });

  it('should keep an absolute URL', () => {
    expect(
      toURL('http://localhost:8233/api/v1/namespaces?a=1', { b: '2' }),
    ).toBe('http://localhost:8233/api/v1/namespaces?a=1&b=2');
  });
});
