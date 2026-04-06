import { writable } from 'svelte/store';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { base } from '$app/paths';

import type {
  EventSortOrder,
  WorkflowViewPreference,
} from '$lib/stores/event-view';

import {
  baseRouteForWorkflow,
  hasParameters,
  isEventHistoryParameters,
  isEventParameters,
  isNamespaceParameter,
  isWorkflowParameters,
  routeForArchivalWorkflows,
  routeForAuthentication,
  routeForCallStack,
  routeForEventHistory,
  routeForEventHistoryImport,
  routeForLoginPage,
  routeForNamespace,
  routeForNamespaces,
  routeForPendingActivities,
  routeForSchedule,
  routeForScheduleCreate,
  routeForSchedules,
  routeForTaskQueue,
  routeForWorkers,
  routeForWorkflowQuery,
  routeForWorkflows,
  routeForWorkflowsWithQuery,
} from './route-for';

describe('routeFor', () => {
  it('should route to "namespaces"', () => {
    const path = routeForNamespaces();
    expect(path).toBe(`${base}/namespaces`);
  });

  it('should route to a "namespace"', () => {
    const path = routeForNamespace({
      namespace: 'default',
    });
    expect(path).toBe(`${base}/namespaces/default`);
  });

  it('should route to "workflows with query"', () => {
    const path = routeForWorkflowsWithQuery({
      namespace: 'default',
      query: 'ExecutionStatus="Running"',
    });
    expect(path).toBe(
      `${base}/namespaces/default/workflows?query=ExecutionStatus%3D%22Running%22`,
    );
  });

  it('should route to "workflows"', () => {
    const path = routeForWorkflows({ namespace: 'default' });
    expect(path).toBe(`${base}/namespaces/default/workflows`);
  });

  it('should route to archival workflows', () => {
    const path = routeForArchivalWorkflows({ namespace: 'default' });
    expect(path).toBe(`${base}/namespaces/default/archival`);
  });

  it('should route to a "workflow"', () => {
    const path = baseRouteForWorkflow({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(`${base}/namespaces/default/workflows/abc/def`);
  });

  it('should route to "workflow.events" history page', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(`${base}/namespaces/default/workflows/abc/def/history`);
  });

  it('should route to "archival.events" history page', () => {
    const path = routeForEventHistory({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
      archival: true,
    });
    expect(path).toBe(`${base}/namespaces/default/archival/abc/def/history`);
  });

  it('should route to pending activities', () => {
    const path = routeForPendingActivities({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(
      `${base}/namespaces/default/workflows/abc/def/pending-activities`,
    );
  });

  it('should route to "workflow".call-stack', () => {
    const path = routeForCallStack({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(
      `${base}/namespaces/default/workflows/abc/def/call-stack`,
    );
  });

  it('should route to "workflow".query', () => {
    const path = routeForWorkflowQuery({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(`${base}/namespaces/default/workflows/abc/def/query`);
  });

  it('should route to "workers"', () => {
    const path = routeForWorkers({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe(`${base}/namespaces/default/workflows/abc/def/workers`);
  });

  it('should route to a task queue', () => {
    const path = routeForTaskQueue({
      namespace: 'default',
      queue: 'some-task-queue',
    });
    expect(path).toBe(`${base}/namespaces/default/task-queues/some-task-queue`);
  });

  it('should route to a task queue containing slashes', () => {
    const path = routeForTaskQueue({
      namespace: 'default',
      queue: 'some/task-queue',
    });
    expect(path).toBe(
      `${base}/namespaces/default/task-queues/some%2Ftask-queue`,
    );
  });
});

describe('routeFor import ', () => {
  it('should default route to "import/events" for import', () => {
    const path = routeForEventHistoryImport();
    expect(path).toBe(`${base}/import/events`);
  });

  it('should route to specific namespace and view for import', () => {
    const path = routeForEventHistoryImport('default', 'compact');
    expect(path).toBe(
      `${base}/import/events/default/workflow/run/history/compact`,
    );
  });

  it('should route to root import if missing namespace', () => {
    const path = routeForEventHistoryImport(undefined, 'compact');
    expect(path).toBe(`${base}/import/events`);
  });

  it('should return the correct route for routeForSchedules', () => {
    expect(routeForSchedules({ namespace: 'default' })).toBe(
      `${base}/namespaces/default/schedules`,
    );
  });

  it('should return the correct route for routeForSchedule', () => {
    expect(routeForSchedule({ namespace: 'default', scheduleId: '123' })).toBe(
      `${base}/namespaces/default/schedules/123`,
    );
  });

  it('should return the correct route for routeForScheduleCreate', () => {
    expect(routeForScheduleCreate({ namespace: 'default' })).toBe(
      `${base}/namespaces/default/schedules/create`,
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
      `https://localhost${base}/auth/sso?returnUrl=${encodeURIComponent(originUrl)}`,
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
      `https://localhost${base}/auth/sso?returnUrl=${encodeURIComponent(returnUrl)}`,
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
    expect(sso).toEqual(`https://localhost${base}/auth/sso`);
  });

  it('Should render a login url', () => {
    const settings = { auth: {}, baseUrl: 'https://localhost' };
    const searchParams = new URLSearchParams();

    const sso = routeForAuthentication({ settings, searchParams });

    expect(sso).toEqual(`https://localhost${base}/auth/sso`);
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
      'https://localhost/some/path',
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
      `https://localhost${base}/auth/sso?organization_name=temporal-cloud&invitation=Wwv6g2cKkfjyqoLxnCPUCfiKcjHKpK%5B%E2%80%A6%5Dn9ipxcao0jKYH0I3`,
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
        `https://temporal.io${base}/login?returnUrl=https%3A%2F%2Ftemporal.io%2Fcurrent-page`,
      );
    });

    it('should return a URL with the correct returnUrl', () => {
      expect(routeForLoginPage('', false)).toBe(`${base}/login`);
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
          eventId: '1234',
        }),
      ).toBe(true);
    });

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
        }),
      ).toBe(false);
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

describe('routeForWorkflow', () => {
  const workflowParams = {
    namespace: 'default',
    workflow: 'abc',
    run: 'def',
  };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function getRouteForWorkflow(
    tab: WorkflowViewPreference,
    sort: EventSortOrder,
  ) {
    vi.doMock('$lib/stores/event-view', () => ({
      workflowViewPreference: writable(tab),
      eventFilterSort: writable(sort),
    }));
    return (await import('./route-for')).routeForWorkflow;
  }

  it('should route to timeline when preference is timeline', async () => {
    const routeForWorkflowFn = await getRouteForWorkflow(
      'timeline',
      'descending',
    );
    expect(routeForWorkflowFn(workflowParams)).toBe(
      `${base}/namespaces/default/workflows/abc/def/timeline`,
    );
  });

  it('should route to history when preference is history', async () => {
    const routeForWorkflowFn = await getRouteForWorkflow(
      'history',
      'descending',
    );
    expect(routeForWorkflowFn(workflowParams)).toBe(
      `${base}/namespaces/default/workflows/abc/def/history`,
    );
  });

  it('should include sort param when sort is ascending', async () => {
    const routeForWorkflowFn = await getRouteForWorkflow(
      'timeline',
      'ascending',
    );
    expect(routeForWorkflowFn(workflowParams)).toBe(
      `${base}/namespaces/default/workflows/abc/def/timeline?sort=ascending`,
    );
  });

  it('should not include sort param when sort is descending', async () => {
    const routeForWorkflowFn = await getRouteForWorkflow(
      'history',
      'descending',
    );
    expect(routeForWorkflowFn(workflowParams)).not.toContain('sort=');
  });

  it('should merge caller queryParams with sort preference', async () => {
    const routeForWorkflowFn = await getRouteForWorkflow(
      'history',
      'ascending',
    );
    const path = routeForWorkflowFn({
      ...workflowParams,
      queryParams: { category: 'activity' },
    });
    expect(path).toContain('sort=ascending');
    expect(path).toContain('category=activity');
  });

  it('should allow caller queryParams sort to override eventFilterSort', async () => {
    const routeForWorkflowFn = await getRouteForWorkflow(
      'history',
      'descending',
    );
    const path = routeForWorkflowFn({
      ...workflowParams,
      queryParams: { sort: 'ascending' },
    });
    expect(path).toContain('sort=ascending');
    expect(path).not.toContain('sort=descending');
  });
});
