import { describe, test, expect } from 'vitest';
import { workflowSignalEnabled } from './workflow-signal-enabled';

describe('workflowSignalEnabled', () => {
  test("returns true when we're not in legacy cloud, when write actions are enabled, and when signal is enabled", () => {
    expect(
      workflowSignalEnabled({
        runtimeEnvironemt: { isCloud: false },
        disableWriteActions: false,
        worklowCancelDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('for legacy cloud', () => {
      expect(
        workflowSignalEnabled({ runtimeEnvironment: { isCloud: true } }),
      ).toBe(false);
    });

    test('when write actions are disabled', () => {
      expect(
        workflowSignalEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: true,
        }),
      ).toBe(false);
    });

    test('when signal is disabled', () => {
      expect(
        workflowSignalEnabled({
          runtimeEnvironment: { isCloud: false },
          disableWriteActions: false,
          workflowSignalDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
