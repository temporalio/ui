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
  standaloneActivityOperatorCommands: boolean | undefined,
  settings: Record<string, unknown> = {},
): Page =>
  ({
    data: {
      namespace: {
        namespaceInfo: {
          capabilities: { standaloneActivityOperatorCommands },
        },
      },
      settings: {
        disableWriteActions: false,
        activityCommandsDisabled: false,
        ...settings,
      },
    },
    params: { namespace: 'default' },
  }) as unknown as Page;

describe('standaloneActivityCommandsDisabled', () => {
  test('is disabled when the namespace does not support operator commands', () => {
    expect(standaloneActivityCommandsDisabled(buildPage(false))).toBe(true);
  });

  test('is disabled when the operator commands capability is missing', () => {
    expect(standaloneActivityCommandsDisabled(buildPage(undefined))).toBe(true);
  });

  test('is enabled when the namespace supports operator commands', () => {
    expect(standaloneActivityCommandsDisabled(buildPage(true))).toBe(false);
  });

  test('is disabled on a supported namespace when write actions are disabled', () => {
    expect(
      standaloneActivityCommandsDisabled(
        buildPage(true, { disableWriteActions: true }),
      ),
    ).toBe(true);
  });
});
