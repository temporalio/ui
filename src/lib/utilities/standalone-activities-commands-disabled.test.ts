import { readable } from 'svelte/store';

import type { Page } from '@sveltejs/kit';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('$lib/stores/core-user', () => ({
  coreUserStore: () =>
    readable({
      namespaceWriteDisabled: () => false,
      isActivityCommandsDisabled: false,
    }),
}));

const gaEnabled = vi.hoisted(() => ({ value: true }));

vi.mock('./core-provider', () => ({
  getStandaloneActivitiesGaEnabled: () => gaEnabled.value,
}));

import { standaloneActivityCommandsDisabled } from './standalone-activities-commands-disabled';

const buildPage = (
  version: string | undefined,
  settings: Record<string, unknown> = {},
): Page =>
  ({
    data: {
      cluster: { serverVersion: version },
      settings: {
        disableWriteActions: false,
        activityCommandsDisabled: false,
        ...settings,
      },
    },
    params: { namespace: 'default' },
  }) as unknown as Page;

describe('standaloneActivityCommandsDisabled', () => {
  afterEach(() => {
    gaEnabled.value = true;
  });

  test('is disabled when standalone activities GA is not enabled', () => {
    gaEnabled.value = false;
    expect(standaloneActivityCommandsDisabled(buildPage('1.32.0'))).toBe(true);
  });

  test('is disabled when the server version is below 1.32.0', () => {
    expect(standaloneActivityCommandsDisabled(buildPage('1.31.1'))).toBe(true);
  });

  test('is enabled when the server version is missing', () => {
    expect(standaloneActivityCommandsDisabled(buildPage(undefined))).toBe(
      false,
    );
  });

  test('is enabled at the minimum required version', () => {
    expect(standaloneActivityCommandsDisabled(buildPage('1.32.0'))).toBe(false);
  });

  test('is enabled above the minimum required version', () => {
    expect(standaloneActivityCommandsDisabled(buildPage('1.32.0'))).toBe(false);
  });

  test('is disabled on a supported version when write actions are disabled', () => {
    expect(
      standaloneActivityCommandsDisabled(
        buildPage('1.32.0', { disableWriteActions: true }),
      ),
    ).toBe(true);
  });
});
