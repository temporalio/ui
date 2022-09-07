import { derived } from 'svelte/store';
import { cluster } from './cluster';
import { settings } from './settings';
export const temporalVersion = derived([cluster], ([$cluster]) => {
    return $cluster === null || $cluster === void 0 ? void 0 : $cluster.serverVersion;
});
export const uiVersion = derived([settings], ([$settings]) => {
    return $settings === null || $settings === void 0 ? void 0 : $settings.version;
});
