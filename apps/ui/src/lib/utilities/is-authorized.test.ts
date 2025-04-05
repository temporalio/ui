import { describe, expect, it } from 'vitest';

import { isAuthorized } from './is-authorized';

const user = {
  accessToken: 'xxx',
};

const noUser = {
  name: 'name',
  email: 'email',
  picture: 'picture',
  idToken: 'idToken',
};

const getSettings = (enabled: boolean) => ({
  auth: {
    enabled,
    options: [],
  },
  baseUrl: 'www.base.com',
  defaultNamespace: 'default',
  showTemporalSystemNamespace: false,
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: false,
  },
});

describe('isAuthorized', () => {
  it('should return true if auth no enabled and no user', () => {
    expect(isAuthorized(getSettings(false), noUser)).toBe(true);
  });
  it('should return true if auth no enabled and user', () => {
    expect(isAuthorized(getSettings(false), user)).toBe(true);
  });
  it('should return false if auth enabled and no user', () => {
    expect(isAuthorized(getSettings(true), noUser)).toBe(false);
  });
  it('should return true if auth enabled and user', () => {
    expect(isAuthorized(getSettings(true), user)).toBe(true);
  });
});
