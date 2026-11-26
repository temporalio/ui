import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowResetEnabled } from './workflow-reset-enabled';

describe('workflowResetEnabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns true when global write actions and reset are enabled', () => {
    expect(
      workflowResetEnabled('namespace', {
        disableWriteActions: false,
        workflowResetDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowResetEnabled('namespace', {
          disableWriteActions: true,
          workflowResetDisabled: false,
        }),
      ).toBe(false);
    });

    test('when reset is disabled', () => {
      expect(
        workflowResetEnabled('namespace', {
          disableWriteActions: false,
          workflowResetDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and reset are both disabled', () => {
      expect(
        workflowResetEnabled('namespace', {
          disableWriteActions: true,
          workflowResetDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
