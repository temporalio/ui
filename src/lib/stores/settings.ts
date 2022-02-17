import { writable } from 'svelte/store';

import { fetchSettings } from '$lib/services/settings-service';

export const settings = writable<Settings | null>(null);

export const loadSettings = async (): Promise<void> => {
  const settingsRes = await fetchSettings();
  settings.set(settingsRes);
};
