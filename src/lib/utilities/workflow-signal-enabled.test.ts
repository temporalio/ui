import { describe, expect, test } from 'vitest';

import { workflowSignalEnabled } from './workflow-signal-enabled';

describe('workflowSignalEnabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
  };

  test('returns true when global write actions, signal, and namespace write actions are all enabled', () => {
    expect(
      workflowSignalEnabled(
        {
          disableWriteActions: false,
          worklowCancelDisabled: false,
        },
        coreUser,
        'ns-wriete-enabled',
      ),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        workflowSignalEnabled(
          {
            disableWriteActions: true,
            workflowCancelDisabled: false,
          },
          coreUser,
          'ns-wriete-enabled',
        ),
      ).toBe(false);
    });

    test('when signal is disabled', () => {
      expect(
        workflowSignalEnabled(
          {
            disableWriteActions: false,
            workflowSignalDisabled: true,
          },
          coreUser,
          'ns-wriete-enabled',
        ),
      ).toBe(false);
    });

    test('when write actions and signal are both disabled', () => {
      expect(
        workflowSignalEnabled(
          {
            disableWriteActions: true,
            workflowSignalDisabled: true,
          },
          coreUser,
          'ns-wriete-enabled',
        ),
      ).toBe(false);
    });

    test('when namespace write actions are disabled', () => {
      expect(
        workflowSignalEnabled(
          {
            disableWriteActions: false,
            workflowSignalDisabled: false,
          },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(false);
    });
  });
});
