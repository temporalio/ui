import { writable } from 'svelte/store';

export const settings = writable<Settings>({
  auth: {
    enabled: false,
    options: null,
  },
  baseUrl: '',
  codec: {
    endpoint: '',
    accessToken: '',
  },
  defaultNamespace: null,
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
