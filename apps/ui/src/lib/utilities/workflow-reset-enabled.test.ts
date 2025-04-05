import { describe, expect, test } from 'vitest';

import { workflowResetEnabled } from './workflow-reset-enabled';

describe('workflowResetEnabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
  };

  test('returns true when global write actions, reset, and namespace write actions are all enabled', () => {
    expect(
      workflowResetEnabled(
        {
          disableWriteActions: false,
          worklowResetDisabled: false,
        },
        coreUser,
        'ns-write-enabled',
      ),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowResetEnabled(
          {
            disableWriteActions: true,
            workflowResetDisabled: false,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when reset is disabled', () => {
      expect(
        workflowResetEnabled(
          {
            disableWriteActions: false,
            workflowResetDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when write actions and reset are both disabled', () => {
      expect(
        workflowResetEnabled(
          {
            disableWriteActions: true,
            workflowResetDisabled: true,
          },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(false);
    });

    test('when namespace write actions are disabled', () => {
      expect(
        workflowResetEnabled(
          {
            disableWriteActions: false,
            workflowResetDisabled: false,
          },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(false);
    });
  });
});
