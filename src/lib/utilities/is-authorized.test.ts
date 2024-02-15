import { describe, expect, it } from 'vitest';

import { isAuthorized } from './is-authorized';

const codeUser = {
  accessToken: 'accessToken',
};

const implicitUser = {
  idToken: 'idToken',
};

const noUser = {
  name: 'name',
  email: 'email',
  picture: 'picture',
};

const getSettings = (enabled: boolean, flow: string) => ({
  auth: {
    enabled,
    flow,
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
  it('should return true if auth not enabled and no user', () => {
    expect(isAuthorized(getSettings(false, 'authorization-code'), noUser)).toBe(
      true,
    );
  });
  it('should return true if auth not enabled and user', () => {
    expect(
      isAuthorized(getSettings(false, 'authorization-code'), codeUser),
    ).toBe(true);
  });
  it('should return false if code auth enabled and no user', () => {
    expect(isAuthorized(getSettings(true, 'authorization-code'), noUser)).toBe(
      false,
    );
  });
  it('should return false if code auth enabled and implicit user', () => {
    expect(
      isAuthorized(getSettings(true, 'authorization-code'), implicitUser),
    ).toBe(false);
  });
  it('should return true if code auth enabled and code user', () => {
    expect(
      isAuthorized(getSettings(true, 'authorization-code'), codeUser),
    ).toBe(true);
  });
  it('should return false if implicit auth enabled and no user', () => {
    expect(isAuthorized(getSettings(true, 'implicit'), noUser)).toBe(false);
  });
  it('should return false if implicit auth enabled and implicit user', () => {
    expect(isAuthorized(getSettings(true, 'implicit'), codeUser)).toBe(false);
  });
  it('should return true if implicit auth enabled and implicit user', () => {
    expect(isAuthorized(getSettings(true, 'implicit'), implicitUser)).toBe(
      true,
    );
  });
});
