import { afterEach, describe, expect, it, vi } from 'vitest';

import { getApiOrigin } from './get-api-origin';

const env = import.meta.env as Record<string, string | undefined>;

describe('getApiOrigin', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return VITE_API if it is set to absolute URL', () => {
    env.VITE_API = 'http://localhost:8080';

    const url = getApiOrigin();
    expect(url).toEqual('http://localhost:8080');
  });

  it('should return URL with no trail slash', () => {
    env.VITE_API = 'http://localhost:8080/';

    const url = getApiOrigin();
    expect(url).toEqual('http://localhost:8080');
  });

  it('should replace relative path with window location origin', () => {
    env.VITE_API = '';
    let url = getApiOrigin();
    expect(url).toEqual('http://localhost:3000');

    env.VITE_API = '/';
    url = getApiOrigin();
    expect(url).toEqual('http://localhost:3000');
  });

  it('should work with relativel URLs', () => {
    env.VITE_API = '/relative/api';

    const url = getApiOrigin();
    expect(url).toBe('http://localhost:3000/relative/api');
  });

  it('should return an empty string if not running in the browser', () => {
    env.VITE_API = '/relative/api';

    const url = getApiOrigin(false);
    expect(url).toBe('');
  });

  it('should return null when VITE_API is undefined', () => {
    delete env.VITE_API;
    expect(() => getApiOrigin()).not.toThrow();
    expect(getApiOrigin()).toBeNull();
  });
});
