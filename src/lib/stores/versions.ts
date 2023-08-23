import { derived } from 'svelte/store';

import { cluster } from './cluster';
import { settings } from './settings';

export const temporalVersion = derived([cluster], ([$cluster]) => {
  return $cluster?.serverVersion;
});

export const uiVersion = derived([settings], ([$settings]) => {
  return $settings?.version;
});
