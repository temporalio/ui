import { getContext } from 'svelte';

export function getAppContext(key: 'group'): boolean;
export function getAppContext(key: string): unknown {
  return getContext(key);
}
