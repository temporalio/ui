import { writable } from 'svelte/store';

import type { Settings } from '$lib/types/global';

export const settings = writable<Settings>({
  auth: {
    enabled: false,
    options: null,
  },
  baseUrl: '',
  codec: {
    endpoint: '',
    passAccessToken: false,
    includeCredentials: false,
  },
  defaultNamespace: null,
  disableWriteActions: false,
  batchActionsDisabled: false,
  workflowTerminateDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowResetDisabled: false,
  hideWorkflowQueryErrors: false,
  showTemporalSystemNamespace: false,
  notifyOnNewVersion: false,
  feedbackURL: '',
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: true,
  },
  version: '',
});
