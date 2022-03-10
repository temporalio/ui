import { writable } from 'svelte/store';

import { fetchSettings } from '$lib/services/settings-service';

/**
 * We await loadSettings this store in the main __layout so it should already be hydrated to any other part of the app
 */
export const settings = writable<Settings | null>(null);

export const loadSettings = async (): Promise<void> => {
  const settingsRes = await fetchSettings();
  settings.set(settingsRes);
};
