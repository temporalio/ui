import { getLoginUrl } from './get-login-url';

describe('Get login url ', () => {
  it('Options added through settings should be passed in the url', () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const params = new URLSearchParams();
    params.set('one', '1');
    params.set('two', '2');

    const login = getLoginUrl(settings, params);

    const loginUrl = new URL(login);

    expect(loginUrl.searchParams.get('one')).toBe('1');
    expect(loginUrl.searchParams.get('two')).toBeNull();
  });
  it("We should not add the options from the search param if they don't exist in the current url params", () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const params = new URLSearchParams();

    const login = getLoginUrl(settings, params);

    const loginUrl = new URL(login);

    expect(loginUrl.searchParams.get('one')).toBeNull();
    expect(login).toEqual('https://localhost/auth/sso');
  });
  it('Should render a login url', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };

    const params = new URLSearchParams();

    const login = getLoginUrl(settings, params);

    expect(login).toEqual('https://localhost/auth/sso');
  });
  it('test of the signin flow', () => {
    const settings = {
      auth: {
        options: ['organization_name', 'invitation'],
      },
      baseUrl: 'https://localhost/',
    };

    const params = new URLSearchParams(
      'invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3&organization_name=temporal-cloud',
    );

    const login = getLoginUrl(settings, params);

    const loginUrl = new URL(login);

    expect(loginUrl.searchParams.get('one')).toBeNull();
    expect(login).toEqual(
      'https://localhost/auth/sso?organization_name=temporal-cloud&invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3',
    );
  });
});
