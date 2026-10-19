import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowTerminateEnabled } from './workflow-terminate-enabled';

describe('workflowTerminateEnabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns true when global write actions and terminate are enabled', () => {
    expect(
      workflowTerminateEnabled('namespace', {
        disableWriteActions: false,
        workflowTerminateDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowTerminateEnabled('namespace', { disableWriteActions: true }),
      ).toBe(false);
    });

    test('when terminate is disabled', () => {
      expect(
        workflowTerminateEnabled('namespace', {
          disableWriteActions: false,
          workflowTerminateDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and terminate are both disabled', () => {
      expect(
        workflowTerminateEnabled('namespace', {
          disableWriteActions: true,
          workflowTerminateDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
