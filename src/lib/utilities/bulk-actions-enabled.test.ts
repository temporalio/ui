import { expect, describe, test } from 'vitest';
import { bulkActionsEnabled } from './bulk-actions-enabled';

describe('bulkActionsEnabled', () => {
  test("returns true when the temporal version and cluster support bulk actions, we're not in cloud, and when at least 1 write actions is enabled", () => {
    expect(
      bulkActionsEnabled(
        {
          disableWriteActions: false,
          disableBulkActions: false,
          workflowTerminateDisabled: false,
          workflowCancelDisabled: false,
        },
        true,
      ),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when the bulk actions are not supported by either the temporal version or cluster', () => {
      expect(bulkActionsEnabled({}, false)).toBe(false);
    });

    test('when write actions are disabled', () => {
      expect(
        bulkActionsEnabled(
          {
            disableWriteActions: true,
            batchActionsDisabled: false,
            workflowCancelDisabled: false,
            workflowTerminateDisabled: false,
          },
          true,
        ),
      ).toBe(false);
    });

    test('when bulk actions are disabled', () => {
      expect(
        bulkActionsEnabled(
          {
            disableWriteActions: false,
            batchActionsDisabled: true,
            workflowCancelDisabled: false,
            workflowTerminateDisabled: false,
          },
          true,
        ),
      ).toBe(false);
    });

    test('when neither terminate or cancel are enabled', () => {
      expect(
        bulkActionsEnabled(
          {
            disableWriteActions: false,
            batchActionsDisabled: false,
            workflowCancelDisabled: true,
            workflowTerminateDisabled: true,
          },
          true,
        ),
      ).toBe(false);
    });
  });
});
