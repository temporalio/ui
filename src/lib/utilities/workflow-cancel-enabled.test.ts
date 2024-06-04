import { describe, expect, test } from 'vitest';

import { workflowCancelEnabled } from './workflow-cancel-enabled';

describe('workflowCancelEnabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
  };

  test('returns true when global write actions, cancel, and namespace write are all enabled', () => {
    expect(
      workflowCancelEnabled(
        {
          disableWriteActions: false,
          worklowCancelDisabled: false,
        },
        coreUser,
        'ns-write-enabled',
      ),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowCancelEnabled(
          {
            disableWriteActions: true,
            workflowCancelDisabled: false,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when cancel is disabled', () => {
      expect(
        workflowCancelEnabled(
          {
            disableWriteActions: false,
            workflowCancelDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when write actions and cancel are both disabled', () => {
      expect(
        workflowCancelEnabled(
          {
            disableWriteActions: true,
            workflowCancelDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when write actions are disabled on the namespace', () => {
      expect(
        workflowCancelEnabled(
          {
            disableWriteActions: false,
            workflowCancelDisabled: false,
          },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(false);
    });
  });
});
