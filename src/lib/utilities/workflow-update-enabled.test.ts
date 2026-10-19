import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowUpdateEnabled } from './workflow-update-enabled';

describe('workflowUpdateEnabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns true when global write actions and update are enabled', () => {
    expect(
      workflowUpdateEnabled('namespace', {
        disableWriteActions: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowUpdateEnabled('namespace', {
          disableWriteActions: true,
          workflowUpdateDisabled: false,
        }),
      ).toBe(false);
    });

    test('when update is disabled', () => {
      expect(
        workflowUpdateEnabled('namespace', {
          disableWriteActions: false,
          workflowUpdateDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and update are both disabled', () => {
      expect(
        workflowUpdateEnabled('namespace', {
          disableWriteActions: true,
          workflowUpdateDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
