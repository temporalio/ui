import { describe, test, expect } from 'vitest';
import { get } from 'svelte/store';

import { cluster } from './cluster';
import { settings } from './settings';

import { supportsBulkActions } from './bulk-actions';

describe('supportsBulkActions store', () => {
  test('returns true for cloud, when batch actions are enabled, and visibility store is elasticsearch regardless of server version', () => {
    cluster.set({ serverVersion: '1.0.0', visibilityStore: 'elasticsearch' });
    settings.set({
      runtimeEnvironment: { isCloud: true },
      batchActionsDisabled: false,
    });

    expect(get(supportsBulkActions)).toBe(true);
  });

  test('returns true for local when version is newer than 1.18.0, advanced visibility is supported, and batch actions are enabled', () => {
    cluster.set({ serverVersion: '1.19.0', visibilityStore: 'elasticsearch' });
    settings.set({
      batchActionsDisabled: false,
      runtimeEnvironment: { isCloud: false },
    });

    expect(get(supportsBulkActions)).toBe(true);
  });

  test('returns false for local when version is older, even if visibility store is elasticsearch and batch actions are enabled', () => {
    cluster.set({ serverVersion: '1.17.0', visibilityStore: 'elasticsearch' });
    settings.set({
      batchActionsDisabled: false,
      runtimeEnvironemt: { isCloud: false },
    });

    expect(get(supportsBulkActions)).toBe(false);
  });

  test('returns false for local when advanced visibility store is not elasticsearch, even if version is newer and batch actions are enabled', () => {
    cluster.set({ serverVersion: '1.19.0', visibilityStore: 'mysql' });
    settings.set({
      batchActionsDisabled: false,
      runtimeEnvironment: { isCloud: false },
    });

    expect(get(supportsBulkActions)).toBe(false);
  });

  test('returns false for local when batch actions are not enabled, even if version is newer and advanced visibility is supported', () => {
    cluster.set({ serverVersion: '1.19.0', visibilityStore: 'elasticsearch' });
    settings.set({ batchActionsDisabled: true });

    expect(get(supportsBulkActions)).toBe(false);
  });
});
