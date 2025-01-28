import { describe, expect, test } from 'vitest';

import { workflowUpdateEnabled } from './workflow-update-enabled';

describe('workflowUpdateEnabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
  };

  test('returns true when global write actions, signal, and namespace write actions are all enabled', () => {
    expect(
      workflowUpdateEnabled(
        {
          disableWriteActions: false,
        },
        coreUser,
        'ns-write-enabled',
      ),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowUpdateEnabled(
          {
            disableWriteActions: true,
            workflowUpdateDisabled: false,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when update is disabled', () => {
      expect(
        workflowUpdateEnabled(
          {
            disableWriteActions: false,
            workflowUpdateDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when write actions and update are both disabled', () => {
      expect(
        workflowUpdateEnabled(
          {
            disableWriteActions: true,
            workflowUpdateDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when namespace write actions are disabled', () => {
      expect(
        workflowUpdateEnabled(
          {
            disableWriteActions: false,
            workflowUpdateDisabled: false,
          },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(false);
    });
  });
});
