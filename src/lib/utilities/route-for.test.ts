import {
  routeForEventHistory,
  routeForAuthentication,
  routeForStackTrace,
  routeForWorkers,
  routeForWorkflow,
  routeForWorkflowQuery,
  routeForWorkflows,
  routeForImport,
} from './route-for';

describe('routeFor', () => {
  it('should route to "workflows"', () => {
    const path = routeForWorkflows({ namespace: 'default' });
    expect(path).toBe('/namespaces/default/workflows');
  });

  it('should route to "workflow"', () => {
    const path = routeForWorkflow({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def');
  });

  it('should route to "workflow.events"', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'summary',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/summary');
  });

  it('should route to "workflow.events"', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'compact',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/compact');
  });

  it('should route to "workflow.events"', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      view: 'json',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history/json');
  });

  it('should route to "workflow".stack-trace', () => {
    const path = routeForStackTrace({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/stack-trace');
  });

  it('should route to "workflow".query', () => {
    const path = routeForWorkflowQuery({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/query');
  });

  it('should route to "workers"', () => {
    const path = routeForWorkers({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/workers');
  });
});

describe('routeFor import ', () => {
  it('should default route to "import/events" for import', () => {
    const path = routeForImport({
      importType: 'events',
    });
    expect(path).toBe('/import/events');
  });
  it('should route to "import/events/history/compact" for import', () => {
    const path = routeForImport({
      importType: 'events',
      view: 'compact',
    });
    expect(path).toBe('/import/events/history/compact');
  });
});

describe('routeFor sso authentication ', () => {
  it('Options added through settings should be passed in the url', () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const searchParams = new URLSearchParams();
    searchParams.set('one', '1');
    searchParams.set('two', '2');

    const sso = routeForAuthentication({ settings, searchParams });

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

    const searchParams = new URLSearchParams();

    const sso = routeForAuthentication({ settings, searchParams });

    const ssoUrl = new URL(sso);

    expect(ssoUrl.searchParams.get('one')).toBeNull();
    expect(sso).toEqual('https://localhost/auth/sso');
  });
  it('Should render a login url', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };
    const searchParams = new URLSearchParams();

    const sso = routeForAuthentication({ settings, searchParams });

    expect(sso).toEqual('https://localhost/auth/sso');
  });
  it('Should add return URL search param', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };

    const searchParams = new URLSearchParams();
    searchParams.set('returnUrl', 'https://localhost/some/path');

    const sso = routeForAuthentication({
      settings,
      searchParams,
    });

    const ssoUrl = new URL(sso);
    expect(ssoUrl.searchParams.get('returnUrl')).toBe(
      `https://localhost/some/path`,
    );
  });
  it('Should not add return URL search param if undefined', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };

    const searchParams = new URLSearchParams();
    const sso = routeForAuthentication({ settings, searchParams });

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

    const searchParams = new URLSearchParams(
      'invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3&organization_name=temporal-cloud',
    );

    const sso = routeForAuthentication({ settings, searchParams });

    const ssoUrl = new URL(sso);

    expect(ssoUrl.searchParams.get('one')).toBeNull();
    expect(sso).toEqual(
      'https://localhost/auth/sso?organization_name=temporal-cloud&invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3',
    );
  });
});
