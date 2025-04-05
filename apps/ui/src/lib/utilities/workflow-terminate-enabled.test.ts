import { describe, expect, test } from 'vitest';

import { workflowTerminateEnabled } from './workflow-terminate-enabled';

describe('workflowTerminateEnabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
  };

  test('returns true when global write actions terminate, and namespace write actions are all enabled', () => {
    expect(
      workflowTerminateEnabled(
        {
          disableWriteActions: false,
          workflowTerminateDisabled: false,
        },
        coreUser,
        'ns-write-enabled',
      ),
    );
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowTerminateEnabled(
          { disableWriteActions: true },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when terminate is disabled', () => {
      expect(
        workflowTerminateEnabled(
          {
            disableWriteActions: false,
            workflowTerminateDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when write actions and terminate are both disabled', () => {
      expect(
        workflowTerminateEnabled(
          {
            disableWriteActions: true,
            workflowTerminateDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when namespace write actions are disabled', () => {
      expect(
        workflowTerminateEnabled(
          {
            disableWriteActions: false,
            workflowTerminateDisabled: false,
          },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(false);
    });
  });
});
