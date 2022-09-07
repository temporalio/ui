import { get } from 'svelte/store';
import { settings } from '../stores/settings';
export const writeActionsAreAllowed = (store = settings) => {
    const isDisabled = get(store).disableWriteActions;
    return !isDisabled;
};
