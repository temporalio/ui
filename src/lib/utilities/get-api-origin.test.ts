import { describe, expect, it } from 'vitest';
import { getApiOrigin } from './get-api-origin';

describe('getApiOrigin', () => {
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
});
