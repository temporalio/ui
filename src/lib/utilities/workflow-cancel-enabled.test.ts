import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowCancelEnabled } from './workflow-cancel-enabled';

describe('workflowCancelEnabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns true when global write actions and cancel are enabled', () => {
    expect(
      workflowCancelEnabled('namespace', {
        disableWriteActions: false,
        workflowCancelDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowCancelEnabled('namespace', {
          disableWriteActions: true,
          workflowCancelDisabled: false,
        }),
      ).toBe(false);
    });

    test('when cancel is disabled', () => {
      expect(
        workflowCancelEnabled('namespace', {
          disableWriteActions: false,
          workflowCancelDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and cancel are both disabled', () => {
      expect(
        workflowCancelEnabled('namespace', {
          disableWriteActions: true,
          workflowCancelDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
