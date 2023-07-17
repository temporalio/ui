import { describe, expect, test } from 'vitest';

import { workflowCancelEnabled } from './workflow-cancel-enabled';

describe('workflowCancelEnabled', () => {
  test('returns true when write actions are enabled, and when cancel is enabled', () => {
    expect(
      workflowCancelEnabled({
        disableWriteActions: false,
        worklowCancelDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowCancelEnabled({
          disableWriteActions: true,
          workflowCancelDisabled: false,
        }),
      ).toBe(false);
    });

    test('when cancel is disabled', () => {
      expect(
        workflowCancelEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: false,
          workflowCancelDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and cancel are both disabled', () => {
      expect(
        workflowCancelEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: true,
          workflowCancelDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
