import { describe, test, expect } from 'vitest';
import { workflowCancelEnabled } from './workflow-cancel-enabled';

describe('workflowCancelEnabled', () => {
  test("returns true when we're not in legacy cloud, when write actions are enabled, and when cancel is enabled", () => {
    expect(
      workflowCancelEnabled({
        runtimeEnvironemt: { isCloud: false },
        disableWriteActions: false,
        worklowCancelDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('for legacy cloud', () => {
      expect(
        workflowCancelEnabled({ runtimeEnvironment: { isCloud: true } }),
      ).toBe(false);
    });

    test('when write actions are disabled', () => {
      expect(
        workflowCancelEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: true,
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
  });
});
