import { writable } from 'svelte/store';

export type NamespaceFairness = {
  enabled: boolean | undefined;
  enableHref?: string;
};

export const namespaceFairness = writable<NamespaceFairness>({
  enabled: undefined,
});
