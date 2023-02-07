import { writable } from 'svelte/store';

export const settings = writable<Settings>({
  auth: {
    enabled: false,
    options: null,
  },
  baseUrl: '',
  codec: {
    endpoint: '',
    passAccessToken: false,
    passCredentials: false,
  },
  defaultNamespace: null,
  disableWriteActions: false,
  batchActionsDisabled: false,
  workflowTerminateDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowResetDisabled: false,
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
