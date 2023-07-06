import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  hasParameters,
  isEventHistoryParameters,
  isEventParameters,
  isNamespaceParameter,
  isWorkflowParameters,
  routeForArchivalWorkfows,
  routeForAuthentication,
  routeForEventHistory,
  routeForEventHistoryImport,
  routeForLoginPage,
  routeForNamespace,
  routeForNamespaces,
  routeForPendingActivities,
  routeForSchedule,
  routeForScheduleCreate,
  routeForSchedules,
  routeForStackTrace,
  routeForTaskQueue,
  routeForWorkers,
  routeForWorkflow,
  routeForWorkflowQuery,
  routeForWorkflows,
  routeForWorkflowsWithQuery,
} from './route-for';

describe('routeFor', () => {
  it('should route to "namespaces"', () => {
    const path = routeForNamespaces();
    expect(path).toBe('/namespaces');
  });

  it('should route to a "namespace"', () => {
    const path = routeForNamespace({
      namespace: 'default',
    });
    expect(path).toBe('/namespaces/default');
  });

  it('should route to "workflows with query"', () => {
    const path = routeForWorkflowsWithQuery({
      namespace: 'default',
      query: 'ExecutionStatus="Running"',
      search: 'basic',
    });
    expect(path).toBe(
      '/namespaces/default/workflows?query=ExecutionStatus%3D%22Running%22&search=basic',
    );
  });

  it('should route to "workflows"', () => {
    const path = routeForWorkflows({ namespace: 'default' });
    expect(path).toBe('/namespaces/default/workflows');
  });

  it('should route to archival workflows', () => {
    const path = routeForArchivalWorkfows({ namespace: 'default' });
    expect(path).toBe('/namespaces/default/archival');
  });

  it('should route to a "workflow"', () => {
    const path = routeForWorkflow({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def');
  });

  it('should route to "workflow.events" history page', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/history');
  });

  it('should route to pending activities', () => {
    const path = routeForPendingActivities({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(
      '/namespaces/default/workflows/abc/def/pending-activities',
    );
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

  it('should route to a task queue', () => {
    const path = routeForTaskQueue({
      namespace: 'default',
      queue: 'some-task-queue',
    });
    expect(path).toBe('/namespaces/default/task-queues/some-task-queue');
  });

  it('should route to a task queue containing slashes', () => {
    const path = routeForTaskQueue({
      namespace: 'default',
      queue: 'some/task-queue',
    });
    expect(path).toBe('/namespaces/default/task-queues/some%2Ftask-queue');
  });
});

describe('routeFor import ', () => {
  it('should default route to "import/events" for import', () => {
    const path = routeForEventHistoryImport();
    expect(path).toBe('/import/events');
  });

  it('should route to specific namespace and view for import', () => {
    const path = routeForEventHistoryImport('default', 'compact');
    expect(path).toBe('/import/events/default/workflow/run/history/compact');
  });

  it('should route to root import if missing namespace', () => {
    const path = routeForEventHistoryImport(undefined, 'compact');
    expect(path).toBe('/import/events');
  });

  it('should return the correct route for routeForSchedules', () => {
    expect(routeForSchedules({ namespace: 'default' })).toBe(
      '/namespaces/default/schedules',
    );
  });

  it('should return the correct route for routeForSchedule', () => {
    expect(routeForSchedule({ namespace: 'default', scheduleId: '123' })).toBe(
      '/namespaces/default/schedules/123',
    );
  });

  it('should return the correct route for routeForScheduleCreate', () => {
    expect(routeForScheduleCreate({ namespace: 'default' })).toBe(
      '/namespaces/default/schedules/create',
    );
  });
});

describe('routeFor SSO authentication ', () => {
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

  it('should fallback to the originUrl if returnUrl is not provided', () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const originUrl = 'https://temporal.io';
    const searchParams = new URLSearchParams();

    const sso = routeForAuthentication({ settings, searchParams, originUrl });

    expect(sso).toBe(
      `${settings.baseUrl}auth/sso?returnUrl=${encodeURIComponent(originUrl)}`,
    );
  });

  it('should use the returnUrl if provided', () => {
    const settings = {
      auth: {
        options: ['one'],
      },
      baseUrl: 'https://localhost/',
    };

    const originUrl = 'https://temporal.io';
    const returnUrl = 'https://return-url.com';
    const searchParams = new URLSearchParams({ returnUrl: returnUrl });

    const sso = routeForAuthentication({ settings, searchParams, originUrl });

    expect(sso).toBe(
      `${settings.baseUrl}auth/sso?returnUrl=${encodeURIComponent(returnUrl)}`,
    );
  });

  it("should not add the options from the search param if they don't exist in the current url params", () => {
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

  describe('routeForLoginPage', () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.resetModules();
    });

    it('should return a URL with the correct returnUrl', () => {
      vi.stubGlobal('window', {
        location: {
          origin: 'https://temporal.io',
          href: 'https://temporal.io/current-page',
        },
      });

      expect(routeForLoginPage()).toBe(
        'https://temporal.io/login?returnUrl=https%3A%2F%2Ftemporal.io%2Fcurrent-page',
      );
    });

    it('should return a URL with the correct returnUrl', () => {
      expect(routeForLoginPage('', false)).toBe('/login');
    });
  });

  describe('hasParameters', () => {
    it('should return true if it has all of the parameters', () => {
      expect(
        hasParameters(
          'namespace',
          'workflow',
        )({ namespace: 'default', workflow: 'workflow-id' }),
      ).toBe(true);
    });

    it('should return false a parameter is missing', () => {
      expect(
        hasParameters('namespace', 'workflow')({ namespace: 'default' }),
      ).toBe(false);
    });

    it('should return true if all of the required parametersisWorkflowParameters$x are provided', () => {
      expect(
        isWorkflowParameters({
          namespace: 'default',
          workflow: 'workflow',
          run: 'run',
        }),
      ).toBe(true);
    });

    it('should return true if all of the required parameters for isEventHistoryParameters are provided', () => {
      expect(
        isEventHistoryParameters({
          namespace: 'default',
          workflow: 'workflow',
          run: 'run',
          view: 'feed',
          queryParams: '?parameter=value',
        }),
      ).toBe(true);
    });

    it('should return true if all of the required parameters for isEventParameters are provided', () => {
      expect(
        isEventParameters({
          namespace: 'default',
          workflow: 'workflow',
          run: 'run',
          view: 'feed',
          eventId: '1234',
        }),
      ).toBe(true);

      it('should return false if all of the required parametersisWorkflowParameters$x are provided', () => {
        expect(
          isWorkflowParameters({
            namespace: 'default',
            workflow: 'workflow',
          }),
        ).toBe(false);
      });

      it('should return false if all of the required parameters for isEventHistoryParameters are provided', () => {
        expect(
          isEventHistoryParameters({
            namespace: 'default',
            workflow: 'workflow',
            run: 'run',
            view: 'feed',
          }),
        ).toBe(false);
      });

      it('should return false if all of the required parameters for isEventParameters are provided', () => {
        expect(
          isEventParameters({
            namespace: 'default',
            workflow: 'workflow',
            run: 'run',
            view: 'feed',
          }),
        ).toBe(false);
      });
    });
  });
});

describe('isNamespaceParameter', () => {
  it('should return true if it has a namespace parameter', () => {
    const result = isNamespaceParameter({ namespace: 'default' });
    expect(result).toBe(true);
  });

  it('should return false if it does not have a namespace parameter', () => {
    const result = isNamespaceParameter({});
    expect(result).toBe(false);
  });
});
