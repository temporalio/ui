import { AppRoutes } from './route-forth';

describe('routeFor', () => {
  it('should route to "workflows"', () => {
    const path = AppRoutes.workflows({ namespace: 'default' });
    expect(path).toBe('/namespaces/default/workflows');
  });

  it('should route to "workflow"', () => {
    const path = AppRoutes.workflow({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def');
  });

  it('should route to "workflow.events"', () => {
    const path = AppRoutes.eventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'summary',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/summary');
  });

  it('should route to "workflow.events"', () => {
    const path = AppRoutes.eventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'compact',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/compact');
  });

  it('should route to "workflow.events"', () => {
    const path = AppRoutes.eventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'json',
    });

    expect(path).toBe('/namespaces/default/workflows/abc/def/history/json');
  });

  it('should route to "workflow".stack-trace', () => {
    const path = AppRoutes.stackTrace({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/stack-trace');
  });

  it('should route to "workflow".query', () => {
    const path = AppRoutes.query({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });

    expect(path).toBe('/namespaces/default/workflows/abc/def/query');
  });

  it('should route to "workers"', () => {
    const path = AppRoutes.workers({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/workers');
  });
});

describe('routeFor sso authentication ', () => {
  beforeAll(() => {
    // I don't really like that we have to set this here. I feel like there may be dragons.
    // But if we do it early enough in the application lifecycle we won't have to worry about it
    AppRoutes.baseUrl = 'https://localhost';
  });
  it('Options added through settings should be passed in the url', () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const currentSearchParams = new URLSearchParams();
    currentSearchParams.set('one', '1');
    currentSearchParams.set('two', '2');

    const sso = AppRoutes.authenticationWithSettings({
      settings,
      currentSearchParams,
    });

    const ssoUrl = new URL(sso);

    expect(ssoUrl.searchParams.get('one')).toBe('1');
    expect(ssoUrl.searchParams.get('two')).toBeNull();
  });
  it("We should not add the options from the search param if they don't exist in the current url params", () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const currentSearchParams = new URLSearchParams();

    const sso = AppRoutes.authenticationWithSettings({
      settings,
      currentSearchParams,
    });

    const ssoUrl = new URL(sso);

    expect(ssoUrl.searchParams.get('one')).toBeNull();
    expect(sso).toEqual('https://localhost/auth/sso');
  });
  it('Should render a login url', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };
    const currentSearchParams = new URLSearchParams();

    const sso = AppRoutes.authenticationWithSettings({
      settings,
      currentSearchParams,
    });

    expect(sso).toEqual('https://localhost/auth/sso');
  });
  it('Should add return URL search param', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };

    const currentSearchParams = new URLSearchParams();
    currentSearchParams.set('returnUrl', 'https://localhost/some/path');

    const sso = AppRoutes.authenticationWithSettings({
      settings,
      currentSearchParams,
    });

    const ssoUrl = new URL(sso);
    expect(ssoUrl.searchParams.get('returnUrl')).toBe(
      `https://localhost/some/path`,
    );
  });
  it('Should not add return URL search param if undefined', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };

    const currentSearchParams = new URLSearchParams();
    const sso = AppRoutes.authenticationWithSettings({
      settings,
      currentSearchParams,
    });

    const ssoUrl = new URL(sso);
    expect(ssoUrl.searchParams.get('returnUrl')).toBe(null);
  });
  it('test of the signin flow', () => {
    const settings = {
      auth: {
        options: ['organization_name', 'invitation'],
      },
      baseUrl: 'https://localhost/',
    };

    const currentSearchParams = new URLSearchParams(
      'invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3&organization_name=temporal-cloud',
    );

    const sso = AppRoutes.authenticationWithSettings({
      settings,
      currentSearchParams,
    });

    const ssoUrl = new URL(sso);

    expect(ssoUrl.searchParams.get('one')).toBeNull();
    expect(sso).toEqual(
      'https://localhost/auth/sso?organization_name=temporal-cloud&invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3',
    );
  });
});
