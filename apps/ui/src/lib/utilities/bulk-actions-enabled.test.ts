import { describe, expect, test } from 'vitest';

import { bulkActionsEnabled } from './bulk-actions-enabled';

describe('bulkActionsEnabled', () => {
  test('returns true when all settings flags are false', () => {
    expect(
      bulkActionsEnabled({
        disableWriteActions: false,
        batchActionsDisabled: false,
        workflowTerminateDisabled: false,
        workflowCancelDisabled: false,
      }),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when `disableWriteActions` is `true`', () => {
      expect(
        bulkActionsEnabled({
          disableWriteActions: true,
        }),
      ).toBe(false);
    });

    test('when `disableWriteActions` is `false`, but `batchActionsDisabled` is `true`', () => {
      expect(
        bulkActionsEnabled({
          disableWriteActions: false,
          batchActionsDisabled: true,
        }),
      ).toBe(false);
    });

    test('when `disableWriteActions` and `batchActionsDisabled` are both `false`, but `worklowCancelDisabled` and `workflowTerminateDisabled` are both true', () => {
      expect(
        bulkActionsEnabled({
          disableWriteActions: false,
          batchActionsDisabled: false,
          workflowCancelDisabled: true,
          workflowTerminateDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
