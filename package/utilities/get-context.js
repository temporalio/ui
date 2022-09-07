import { getContext } from 'svelte';
export function getAppContext(key) {
    return getContext(key);
}
