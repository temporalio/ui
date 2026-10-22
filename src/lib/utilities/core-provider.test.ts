import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  corePermissions,
  getAccessToken,
  getIdToken,
  initCoreProvider,
  runPostResponse,
  runPreRequest,
} from './core-provider';

describe('core-provider', () => {
  afterEach(() => {
    initCoreProvider({
      getAccessToken: async () => '',
    });
  });

  describe('getAccessToken', () => {
    it('should return token from provided getAccessToken function', async () => {
      initCoreProvider({
        getAccessToken: async () => 'my-token',
      });

      const token = await getAccessToken();
      expect(token).toBe('my-token');
    });
  });

  describe('getIdToken', () => {
    it('should return token from provided getIdToken function', async () => {
      initCoreProvider({
        getAccessToken: async () => 'access',
        getIdToken: async () => 'id-token',
      });

      const idToken = await getIdToken();
      expect(idToken).toBe('id-token');
    });

    it('should return undefined when getIdToken is not provided', async () => {
      initCoreProvider({
        getAccessToken: async () => 'access',
      });

      const idToken = await getIdToken();
      expect(idToken).toBeUndefined();
    });
  });

  describe('runPreRequest', () => {
    it('should call the provided preRequest hook', async () => {
      initCoreProvider({
        getAccessToken: async () => 'token',
        api: {
          preRequest: async (ctx) => ({
            ...ctx,
            options: {
              ...ctx.options,
              headers: { Authorization: 'Bearer injected' },
            },
          }),
        },
      });

      const result = await runPreRequest({
        url: '/api/test',
        options: {},
      });

      expect(
        (result.options.headers as Record<string, string>)['Authorization'],
      ).toBe('Bearer injected');
    });

    it('should pass through when no preRequest hook is provided', async () => {
      initCoreProvider({
        getAccessToken: async () => 'token',
      });

      const context = { url: '/api/test', options: { method: 'GET' } };
      const result = await runPreRequest(context);

      expect(result).toEqual(context);
    });
  });

  describe('runPostResponse', () => {
    it('should call the provided postResponse hook', async () => {
      const retryResponse = new Response('retried', { status: 200 });
      const retry = vi.fn().mockResolvedValue(retryResponse);

      initCoreProvider({
        getAccessToken: async () => 'token',
        api: {
          postResponse: async (response, context) => {
            if (response.status === 401) {
              return context.retry();
            }
            return response;
          },
        },
      });

      const unauthorizedResponse = new Response('unauthorized', {
        status: 401,
      });
      const result = await runPostResponse(unauthorizedResponse, {
        url: '/api/test',
        options: {},
        retry,
      });

      expect(retry).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('should pass through when no postResponse hook is provided', async () => {
      initCoreProvider({
        getAccessToken: async () => 'token',
      });

      const response = new Response('ok', { status: 200 });
      const result = await runPostResponse(response, {
        url: '/api/test',
        options: {},
        retry: vi.fn(),
      });

      expect(result).toBe(response);
    });

    it('should not retry on non-401 responses when hook checks status', async () => {
      const retry = vi.fn();

      initCoreProvider({
        getAccessToken: async () => 'token',
        api: {
          postResponse: async (response, context) => {
            if (response.status === 401) return context.retry();
            return response;
          },
        },
      });

      const response = new Response('forbidden', { status: 403 });
      const result = await runPostResponse(response, {
        url: '/api/test',
        options: {},
        retry,
      });

      expect(retry).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
    });
  });

  describe('dependency injection', () => {
    it('should fail clearly when permissions are used before initialization', async () => {
      vi.resetModules();
      const { corePermissions: uninitializedPermissions } =
        await import('./core-provider');

      expect(() =>
        uninitializedPermissions.namespaces.canStartWorkflow('namespace'),
      ).toThrow('Core provider has not been initialized');
    });

    it('should allow swapping providers at runtime', async () => {
      initCoreProvider({
        getAccessToken: async () => 'first',
      });
      expect(await getAccessToken()).toBe('first');

      initCoreProvider({
        getAccessToken: async () => 'second',
      });
      expect(await getAccessToken()).toBe('second');
    });

    it('should use default workflow permissions when none are provided', () => {
      initCoreProvider({
        getAccessToken: async () => '',
      });

      expect(corePermissions.namespaces.canTerminateWorkflow('namespace')).toBe(
        true,
      );
      expect(corePermissions.namespaces.canStartWorkflow('namespace')).toBe(
        true,
      );
      expect(
        corePermissions.namespaces.canChangeWorkflowPauseState('namespace'),
      ).toBe(true);
    });

    it('should delegate every workflow permission to the injected provider', () => {
      const injectedPermissions = {
        canStartWorkflow: vi.fn(() => false),
        canRequestWorkflowCancellation: vi.fn(() => false),
        canSignalWorkflow: vi.fn(() => false),
        canUpdateWorkflow: vi.fn(() => false),
        canTerminateWorkflow: vi.fn(() => false),
        canResetWorkflow: vi.fn(() => false),
        canChangeWorkflowPauseState: vi.fn(() => false),
      };

      initCoreProvider({
        getAccessToken: async () => '',
        permissions: {
          namespaces: injectedPermissions,
        },
      });

      const checks = [
        [
          corePermissions.namespaces.canStartWorkflow,
          injectedPermissions.canStartWorkflow,
        ],
        [
          corePermissions.namespaces.canRequestWorkflowCancellation,
          injectedPermissions.canRequestWorkflowCancellation,
        ],
        [
          corePermissions.namespaces.canSignalWorkflow,
          injectedPermissions.canSignalWorkflow,
        ],
        [
          corePermissions.namespaces.canUpdateWorkflow,
          injectedPermissions.canUpdateWorkflow,
        ],
        [
          corePermissions.namespaces.canTerminateWorkflow,
          injectedPermissions.canTerminateWorkflow,
        ],
        [
          corePermissions.namespaces.canResetWorkflow,
          injectedPermissions.canResetWorkflow,
        ],
        [
          corePermissions.namespaces.canChangeWorkflowPauseState,
          injectedPermissions.canChangeWorkflowPauseState,
        ],
      ];

      for (const [check, injectedCheck] of checks) {
        expect(check('restricted-namespace')).toBe(false);
        expect(injectedCheck).toHaveBeenCalledWith('restricted-namespace');
      }
    });
  });
});
