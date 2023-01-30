import { describe, test, expect } from 'vitest';
import { workflowResetEnabled } from './workflow-reset-enabled';

describe('workflowResetEnabled', () => {
  test("returns true when we're not in legacy cloud, when write actions are enabled, and when reset is enabled", () => {
    expect(
      workflowResetEnabled({
        runtimeEnvironemt: { isCloud: false },
        disableWriteActions: false,
        worklowResetDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('for legacy cloud', () => {
      expect(
        workflowResetEnabled({ runtimeEnvironment: { isCloud: true } }),
      ).toBe(false);
    });

    test('when write actions are disabled', () => {
      expect(
        workflowResetEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: true,
        }),
      ).toBe(false);
    });

    test('when reset is disabled', () => {
      expect(
        workflowResetEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: false,
          workflowResetDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
