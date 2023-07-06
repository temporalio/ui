import { afterEach, describe, expect, it, vi } from 'vitest';

import { getApiOrigin } from './get-api-origin';

describe('getApiOrigin', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return VITE_API if it is set to absolute URL', () => {
    import.meta.env.VITE_API = 'http://localhost:8080';

    const url = getApiOrigin();
    expect(url).toEqual('http://localhost:8080');
  });

  it('should return URL with no trail slash', () => {
    import.meta.env.VITE_API = 'http://localhost:8080/';

    const url = getApiOrigin();
    expect(url).toEqual('http://localhost:8080');
  });

  it('should replace relative path with window location origin', () => {
    import.meta.env.VITE_API = '';
    let url = getApiOrigin();
    expect(url).toEqual('http://localhost:3000');

    import.meta.env.VITE_API = '/';
    url = getApiOrigin();
    expect(url).toEqual('http://localhost:3000');
  });

  it('should work with relativel URLs', () => {
    import.meta.env.VITE_API = '/relative/api';

    const url = getApiOrigin();
    expect(url).toBe('http://localhost:3000/relative/api');
  });

  it('should return an empty string if not running in the browser', () => {
    import.meta.env.VITE_API = '/relative/api';

    const url = getApiOrigin(false);
    expect(url).toBe('');
  });
});
