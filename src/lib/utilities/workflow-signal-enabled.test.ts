import { describe, expect, test } from 'vitest';

import { workflowSignalEnabled } from './workflow-signal-enabled';

describe('workflowSignalEnabled', () => {
  test('returns true when write actions are enabled and when signal is enabled', () => {
    expect(
      workflowSignalEnabled({
        disableWriteActions: false,
        worklowCancelDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowSignalEnabled({
          disableWriteActions: true,
          workflowCancelDisabled: false,
        }),
      ).toBe(false);
    });

    test('when signal is disabled', () => {
      expect(
        workflowSignalEnabled({
          disableWriteActions: false,
          workflowSignalDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and signal are both disabled', () => {
      expect(
        workflowSignalEnabled({
          disableWriteActions: true,
          workflowSignalDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
