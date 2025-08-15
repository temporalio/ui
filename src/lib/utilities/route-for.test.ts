import lscache from 'lscache';
import { afterEach, assert, describe, expect, it, vi } from 'vitest';

import {
  hasParameters,
  isEventHistoryParameters,
  isEventParameters,
  isNamespaceParameter,
  isWorkflowParameters,
  maybeRouteForOIDCImplicitCallback,
  routeForArchivalWorkfows,
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
    });
    expect(path).toBe(
      '/namespaces/default/workflows?query=ExecutionStatus%3D%22Running%22',
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

  it('should route to "workflow".call-stack', () => {
    const path = routeForCallStack({
      namespace: 'default',
      workflow: 'abc',
      run: 'def',
    });
    expect(path).toBe('/namespaces/default/workflows/abc/def/call-stack');
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
        flow: 'authorization-code',
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
        flow: 'authorization-code',
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
        flow: 'authorization-code',
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
        flow: 'authorization-code',
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
    const settings = {
      auth: { flow: 'authorization-code' },
      baseUrl: 'https://localhost',
    };
    const searchParams = new URLSearchParams();

    const sso = routeForAuthentication({ settings, searchParams });

    expect(sso).toEqual('https://localhost/auth/sso');
  });

  it('Should add return URL search param', () => {
    const settings = {
      auth: { flow: 'authorization-code' },
      baseUrl: 'https://localhost',
    };

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
    const settings = {
      auth: { flow: 'authorization-code' },
      baseUrl: 'https://localhost',
    };

    const searchParams = new URLSearchParams();
    const sso = routeForAuthentication({ settings, searchParams });

    const ssoUrl = new URL(sso);
    expect(ssoUrl.searchParams.get('returnUrl')).toBe(null);
  });

  it('test of the signin flow', () => {
    const settings = {
      auth: {
        flow: 'authorization-code',
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

  describe('implicit oidc flow', () => {
    it('should add a nonce', () => {
      const settings = {
        auth: {
          flow: 'implicit',
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          scopes: ['openid', 'email', 'profile'],
        },
        baseUrl: 'https://localhost',
      };

      const searchParams = new URLSearchParams();

      const sso = routeForAuthentication({
        settings,
        searchParams,
      });

      const ssoUrl = new URL(sso);
      expect(window.localStorage.getItem('nonce')).toBe(
        ssoUrl.searchParams.get('nonce'),
      );
      window.localStorage.removeItem('nonce');
    });

    it('should manage oidc state', () => {
      const settings = {
        auth: {
          flow: 'implicit',
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          scopes: ['openid', 'email', 'profile'],
        },
        baseUrl: 'https://localhost',
      };

      const searchParams = new URLSearchParams();
      searchParams.set('returnUrl', 'https://localhost/some/path');

      const sso = routeForAuthentication({
        settings,
        searchParams,
      });

      const ssoUrlStateKey = new URL(sso).searchParams.get('state');
      expect(ssoUrlStateKey).not.toBeNull();

      expect(lscache.get(`oidc.${ssoUrlStateKey as string}`)).toBe(
        'https://localhost/some/path',
      );
      lscache.remove(`oidc.${ssoUrlStateKey as string}`);
    });

    describe('routeFor oidc implicit callback', () => {
      it('should return null if passed an empty hash', () => {
        expect(maybeRouteForOIDCImplicitCallback('#')).toBeNull();
      });

      it('should return null if no ID token in the hash', () => {
        const params = new URLSearchParams({ foo: 'bar', biz: 'baz' });
        expect(maybeRouteForOIDCImplicitCallback(`#${params}`)).toBeNull();
      });

      it('should throw if invalid ID token in the hash', () => {
        const params = new URLSearchParams({
          foo: 'bar',
          biz: 'baz',
          id_token: 'scrooge-mcduck',
        });
        expect(() => maybeRouteForOIDCImplicitCallback(`#${params}`)).toThrow(
          'Invalid id_token in hash',
        );
      });

      // TODO: support optional issuer validation with settings.auth.issuerUrl and token.iss

      /*
       * tokens created from https://jwt.io. can be decoded edited and reencoded from there
       */

      // README: test disabled because of datadog vault's nonce behavior
      it.skip('should throw if the nonce is missing from the token', () => {
        localStorage.setItem('nonce', 'foobar');
        lscache.set(
          'oidc.bluegrass-japan',
          'https://www.youtube.com/watch?v=ylhy7WgFdUM',
        ); // state
        const params = new URLSearchParams({
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWV3b3Jrd2VhciIsIm5hbWUiOiJEZXJlayBHdXkiLCJpYXQiOjE1MTYyMzkwMjJ9.JXIgh2oYQw3Sk8NQL3e89jqaPF8LX4bt1KyrkqeOFx4',
          state: 'bluegrass-japan',
        });

        expect(() => maybeRouteForOIDCImplicitCallback(`#${params}`)).toThrow(
          'No nonce in token',
        );
        localStorage.removeItem('nonce');
        lscache.remove('oidc.bluegrass-japan');
      });

      // README: test disabled because of datadog vault's nonce behavior
      it.skip('should throw if the nonce is mismatched', () => {
        localStorage.setItem('nonce', 'foobar');
        const params = new URLSearchParams({
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWV3b3Jrd2VhciIsIm5hbWUiOiJEZXJlayBHdXkiLCJpYXQiOjE1MTYyMzkwMjIsIm5vbmNlIjoiYml6YmF6In0.NZa8yiSta4lRnemoY9M45ErqluvAPtN12JmRGZAECnY',
        });
        expect(() => maybeRouteForOIDCImplicitCallback(`#${params}`)).toThrow(
          'Mismatched nonces',
        );
        localStorage.removeItem('nonce');
      });

      it('should process the hash into the returned callback struct', () => {
        localStorage.setItem('nonce', 'denim-jacket');
        lscache.set(
          'oidc.roper-boots',
          'https://nationalcowboymuseum.org/plan-your-visit/',
        ); // state

        const params = new URLSearchParams({
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWV3b3Jrd2VhciIsIm5hbWUiOiJEZXJlayBHdXkiLCJpYXQiOjE1MTYyMzkwMjIsImVtYWlsIjoiZGVyZWtAZGlld29ya3dlYXIuY29tIiwibm9uY2UiOiJkZW5pbS1qYWNrZXQifQ.wG64FRrUCoHrQC4wASodyO7_3eeOeUx6myM0QvEKNk4',
          state: 'roper-boots',
        });
        const callback = maybeRouteForOIDCImplicitCallback(`#${params}`);
        expect(callback).not.toBeNull();
        if (callback === null) {
          assert.fail('failed to process a valid hash');
        }

        expect
          .soft(callback.redirectUrl)
          .toBe('https://nationalcowboymuseum.org/plan-your-visit/');

        expect.soft(callback.authUser).toEqual({
          idToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWV3b3Jrd2VhciIsIm5hbWUiOiJEZXJlayBHdXkiLCJpYXQiOjE1MTYyMzkwMjIsImVtYWlsIjoiZGVyZWtAZGlld29ya3dlYXIuY29tIiwibm9uY2UiOiJkZW5pbS1qYWNrZXQifQ.wG64FRrUCoHrQC4wASodyO7_3eeOeUx6myM0QvEKNk4',
          name: 'Derek Guy',
          email: 'derek@dieworkwear.com',
        });

        expect.soft(callback.stateKey).toBe('roper-boots');

        localStorage.removeItem('nonce');
        lscache.remove('oidc.roper-boots');
      });

      it('should throw if the hash state key is missing from session storage', () => {
        localStorage.setItem('nonce', 'denim-jacket');

        const params = new URLSearchParams({
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWV3b3Jrd2VhciIsIm5hbWUiOiJEZXJlayBHdXkiLCJpYXQiOjE1MTYyMzkwMjIsImVtYWlsIjoiZGVyZWtAZGlld29ya3dlYXIuY29tIiwibm9uY2UiOiJkZW5pbS1qYWNrZXQifQ.wG64FRrUCoHrQC4wASodyO7_3eeOeUx6myM0QvEKNk4',
        });

        expect(() => maybeRouteForOIDCImplicitCallback(`#${params}`)).toThrow(
          'No state in hash',
        );

        localStorage.removeItem('nonce');
      });

      it('should throw if the hash state key is missing from the hash', () => {
        localStorage.setItem('nonce', 'denim-jacket');

        const params = new URLSearchParams({
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWV3b3Jrd2VhciIsIm5hbWUiOiJEZXJlayBHdXkiLCJpYXQiOjE1MTYyMzkwMjIsImVtYWlsIjoiZGVyZWtAZGlld29ya3dlYXIuY29tIiwibm9uY2UiOiJkZW5pbS1qYWNrZXQifQ.wG64FRrUCoHrQC4wASodyO7_3eeOeUx6myM0QvEKNk4',
          state: 'western-boots',
        });

        expect(() => maybeRouteForOIDCImplicitCallback(`#${params}`)).toThrow(
          'Hash state missing from localStorage',
        );

        localStorage.removeItem('nonce');
      });
    });
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
