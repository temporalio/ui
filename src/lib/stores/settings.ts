import { writable } from 'svelte/store';

import { fetchSettings } from '$lib/services/settings-service';

export const settings = writable<Settings>({
  auth: {
    enabled: false,
  },
});

export const loadSettings = async (): Promise<void> => {
  const settingsRes = await fetchSettings();
  settings.set(settingsRes);
};
