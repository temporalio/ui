import { expect, describe, test } from 'vitest';
import { bulkActionsEnabled } from './bulk-actions-enabled';

describe('bulkActionsEnabled', () => {
  test("returns true when the temporal version and cluster support bulk actions, we're not in cloud, and when at least 1 write actions is enabled", () => {
    expect(
      bulkActionsEnabled(
        {
          disableWriteActions: false,
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

    test('for legacy cloud', () => {
      expect(
        bulkActionsEnabled({ runtimeEnvironment: { isCloud: true } }, true),
      ).toBe(false);
    });

    test('when write actions are disabled', () => {
      expect(bulkActionsEnabled({ disableWriteActions: true }, false)).toBe(
        false,
      );
    });

    test('when neither terminate or cancel are enabled', () => {
      expect(
        bulkActionsEnabled(
          {
            disableWriteActions: false,
            workflowCancelDisabled: true,
            workflowTerminateDisabled: true,
          },
          false,
        ),
      ).toBe(false);
    });
  });
});
