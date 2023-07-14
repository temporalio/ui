import { describe, expect, test } from 'vitest';

import { workflowResetEnabled } from './workflow-reset-enabled';

describe('workflowResetEnabled', () => {
  test('returns true when write actions are enabled and when reset is enabled', () => {
    expect(
      workflowResetEnabled({
        disableWriteActions: false,
        worklowResetDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowResetEnabled({
          disableWriteActions: true,
          workflowResetDisabled: false,
        }),
      ).toBe(false);
    });

    test('when reset is disabled', () => {
      expect(
        workflowResetEnabled({
          disableWriteActions: false,
          workflowResetDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and reset are both disabled', () => {
      expect(
        workflowResetEnabled({
          disableWriteActions: true,
          workflowResetDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
