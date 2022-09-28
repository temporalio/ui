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
  },
  defaultNamespace: null,
  disableWriteActions: false,
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
