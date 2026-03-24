import { afterEach, describe, expect, it } from 'vitest';

import { getAuthUserCookie } from './auth-user-cookie';

const setCookie = (name: string, value: string) => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: `${name}=${value}`,
  });
};

const clearCookie = () => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
};

afterEach(() => {
  clearCookie();
});

describe('getAuthUserCookie', () => {
  it('should parse a user cookie', () => {
    const payload = JSON.stringify({
      AccessToken: 'access',
      IDToken: 'id',
      Name: 'Test',
      Email: 'test@test.com',
      Picture: '',
    });
    const encoded = btoa(payload);
    setCookie('user0', encoded);

    const user = getAuthUserCookie(true);
    expect(user.accessToken).toBe('access');
    expect(user.idToken).toBe('id');
  });

  it('should correctly parse a base64 cookie value that contains = padding', () => {
    const payload = JSON.stringify({
      AccessToken: 'tk', // btoa of JSON with short values produces = padding
      IDToken: 'x',
      Name: '',
      Email: '',
      Picture: '',
    });
    const encoded = btoa(payload);
    // Verify our test fixture actually has = padding
    expect(encoded.endsWith('=')).toBe(true);
    setCookie('user0', encoded);

    const user = getAuthUserCookie(true);
    expect(user.accessToken).toBe('tk');
  });

  it('should return empty object when no user cookie exists', () => {
    clearCookie();
    const user = getAuthUserCookie(true);
    expect(user).toEqual({});
  });
});
