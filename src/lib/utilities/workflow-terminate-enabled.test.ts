import { describe, expect, test } from 'vitest';

import { workflowTerminateEnabled } from './workflow-terminate-enabled';

describe('workflowTerminateEnabled', () => {
  test('returns true when write actions and terminate are both enabled', () => {
    expect(
      workflowTerminateEnabled({
        disableWriteActions: false,
        workflowTerminateDisabled: false,
      }),
    );
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(workflowTerminateEnabled({ disableWriteActions: true })).toBe(
        false,
      );
    });

    test('when terminate is disabled', () => {
      expect(
        workflowTerminateEnabled({
          disableWriteActions: false,
          workflowTerminateDisabled: true,
        }),
      ).toBe(false);
    });

    test('when write actions and terminate are both disabled', () => {
      expect(
        workflowTerminateEnabled({
          disableWriteActions: true,
          workflowTerminateDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
