import { beforeEach, describe, expect, test } from 'vitest';

import { initCoreProvider } from './core-provider';
import { workflowPauseEnabled } from './workflow-pause-enabled';

describe('workflowPauseEnabled', () => {
  beforeEach(() => {
    initCoreProvider({ getAccessToken: async () => '' });
  });

  test('returns true when settings and namespace permission allow pausing', () => {
    expect(
      workflowPauseEnabled('namespace', {
        disableWriteActions: false,
        workflowPauseDisabled: false,
      }),
    ).toBe(true);
  });

  test.each([{ disableWriteActions: true }, { workflowPauseDisabled: true }])(
    'returns false when settings disable pausing: %j',
    (settings) => {
      expect(workflowPauseEnabled('namespace', settings)).toBe(false);
    },
  );

  test('returns false when the injected provider denies pausing', () => {
    const allow = () => true;
    initCoreProvider({
      getAccessToken: async () => '',
      permissions: {
        namespaces: {
          canStartWorkflow: allow,
          canRequestWorkflowCancellation: allow,
          canSignalWorkflow: allow,
          canUpdateWorkflow: allow,
          canTerminateWorkflow: allow,
          canResetWorkflow: allow,
          canChangeWorkflowPauseState: () => false,
        },
      },
    });

    expect(workflowPauseEnabled('namespace')).toBe(false);
  });
});
