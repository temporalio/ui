import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowCreateDisabled } from './workflow-create-disabled';

describe('workflowCreateDisabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns false when settings and namespace permission allow starting', () => {
    expect(
      workflowCreateDisabled('namespace', {
        disableWriteActions: false,
        startWorkflowDisabled: false,
      }),
    ).toBe(false);
  });

  test.each([{ disableWriteActions: true }, { startWorkflowDisabled: true }])(
    'returns true when settings disable starting: %j',
    (settings) => {
      expect(workflowCreateDisabled('namespace', settings)).toBe(true);
    },
  );

  test('returns true when the injected provider denies starting', () => {
    const allow = () => true;
    initCoreProvider({
      getAccessToken: async () => '',
      permissions: {
        namespaces: {
          canStartWorkflow: () => false,
          canRequestWorkflowCancellation: allow,
          canSignalWorkflow: allow,
          canUpdateWorkflow: allow,
          canTerminateWorkflow: allow,
          canResetWorkflow: allow,
          canChangeWorkflowPauseState: allow,
        },
      },
    });

    expect(workflowCreateDisabled('namespace')).toBe(true);
  });
});
