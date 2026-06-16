import { readable } from 'svelte/store';

import type { Page } from '@sveltejs/kit';
import { describe, expect, test, vi } from 'vitest';

vi.mock('$lib/stores/core-user', () => ({
  coreUserStore: () =>
    readable({
      namespaceWriteDisabled: () => false,
      isActivityCommandsDisabled: false,
    }),
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
  test('is disabled when the server version is below 1.31.2', () => {
    expect(standaloneActivityCommandsDisabled(buildPage('1.31.1'))).toBe(true);
  });

  test('is enabled when the server version is missing', () => {
    expect(standaloneActivityCommandsDisabled(buildPage(undefined))).toBe(
      false,
    );
  });

  test('is enabled at the minimum required version', () => {
    expect(standaloneActivityCommandsDisabled(buildPage('1.31.2'))).toBe(false);
  });

  test('is enabled above the minimum required version', () => {
    expect(standaloneActivityCommandsDisabled(buildPage('1.32.0'))).toBe(false);
  });

  test('is disabled on a supported version when write actions are disabled', () => {
    expect(
      standaloneActivityCommandsDisabled(
        buildPage('1.31.2', { disableWriteActions: true }),
      ),
    ).toBe(true);
  });
});
