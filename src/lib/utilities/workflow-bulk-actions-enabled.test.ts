import { describe, expect, test } from 'vitest';

import { workflowBulkActionsEnabled } from './workflow-bulk-actions-enabled';

describe('workflowBulkActionsEnabled', () => {
  test('returns true when all settings flags are false', () => {
    expect(
      workflowBulkActionsEnabled({
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
        workflowBulkActionsEnabled({
          disableWriteActions: true,
        }),
      ).toBe(false);
    });

    test('when `disableWriteActions` is `false`, but `batchActionsDisabled` is `true`', () => {
      expect(
        workflowBulkActionsEnabled({
          disableWriteActions: false,
          batchActionsDisabled: true,
        }),
      ).toBe(false);
    });

    test('when `disableWriteActions` and `batchActionsDisabled` are both `false`, but `worklowCancelDisabled` and `workflowTerminateDisabled` are both true', () => {
      expect(
        workflowBulkActionsEnabled({
          disableWriteActions: false,
          batchActionsDisabled: false,
          workflowCancelDisabled: true,
          workflowTerminateDisabled: true,
        }),
      ).toBe(false);
    });
  });
});
