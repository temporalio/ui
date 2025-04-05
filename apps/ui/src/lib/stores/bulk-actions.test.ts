import { get, type writable as writableFunc } from 'svelte/store';

import { describe, expect, test, vi } from 'vitest';

import { supportsBulkActions } from './bulk-actions';

const mockedPageStore = await vi.hoisted(async () => {
  const { writable } = await vi.importActual<{
    writable: typeof writableFunc;
  }>('svelte/store');

  const writableStore = writable();
  return {
    subscribe: writableStore.subscribe,
    mockSetSubscribeValue: (value: unknown): void => writableStore.set(value),
  };
});

vi.mock('$app/stores', () => ({
  page: mockedPageStore,
}));

describe('supportsBulkActions store', () => {
  describe('for Cloud', () => {
    test('returns true when batch actions are enabled, and visibility store is elasticsearch regardless of server version', () => {
      mockedPageStore.mockSetSubscribeValue({
        data: {
          settings: {
            runtimeEnvironment: { isCloud: true },
            batchActionsDisabled: false,
          },
          cluster: { serverVersion: '1.0.0', visibilityStore: 'elasticsearch' },
        },
      });

      expect(get(supportsBulkActions)).toBe(true);
    });
  });

  describe('for Local', () => {
    test('returns true when version is newer than 1.18.0, advanced visibility is supported, and batch actions are enabled', () => {
      mockedPageStore.mockSetSubscribeValue({
        data: {
          settings: {
            runtimeEnvironment: { isCloud: false },
            batchActionsDisabled: false,
          },
          cluster: {
            serverVersion: '1.19.0',
            visibilityStore: 'elasticsearch',
          },
        },
      });

      expect(get(supportsBulkActions)).toBe(true);
    });

    test('returns false when version is older, even if visibility store is elasticsearch and batch actions are enabled', () => {
      mockedPageStore.mockSetSubscribeValue({
        data: {
          settings: {
            runtimeEnvironment: { isCloud: false },
            batchActionsDisabled: false,
          },
          cluster: {
            serverVersion: '1.17.0',
            visibilityStore: 'elasticsearch',
          },
        },
      });

      expect(get(supportsBulkActions)).toBe(false);
    });

    test('returns false when advanced visibility store is not elasticsearch, even if version is newer and batch actions are enabled', () => {
      mockedPageStore.mockSetSubscribeValue({
        data: {
          settings: {
            runtimeEnvironment: { isCloud: false },
            batchActionsDisabled: false,
          },
          cluster: { serverVersion: '1.19.0', visibilityStore: 'mysql' },
        },
      });

      expect(get(supportsBulkActions)).toBe(false);
    });

    test('returns false when batch actions are not enabled, even if version is newer and advanced visibility is supported', () => {
      mockedPageStore.mockSetSubscribeValue({
        data: {
          settings: {
            runtimeEnvironment: { isCloud: false },
            batchActionsDisabled: true,
          },
          cluster: {
            serverVersion: '1.19.0',
            visibilityStore: 'elasticsearch',
          },
        },
      });

      expect(get(supportsBulkActions)).toBe(false);
    });
  });
});
