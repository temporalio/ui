import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowSignalEnabled } from './workflow-signal-enabled';

describe('workflowSignalEnabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns true when global write actions and signal are enabled', () => {
    expect(
      workflowSignalEnabled('namespace', {
        disableWriteActions: false,
        workflowSignalDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowSignalEnabled('namespace', {
          disableWriteActions: true,
          workflowSignalDisabled: false,
        }),
      ).toBe(false);
    });

    test('when signal is disabled', () => {
      expect(
        workflowSignalEnabled('namespace', {
          disableWriteActions: false,
          workflowSignalDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and signal are both disabled', () => {
      expect(
        workflowSignalEnabled('namespace', {
          disableWriteActions: true,
          workflowSignalDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
