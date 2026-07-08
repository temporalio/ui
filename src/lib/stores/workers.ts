import { derived, writable } from 'svelte/store';

import { minimumVersionRequired } from '$lib/utilities/version-check';

import { isCloud } from './advanced-visibility';
import { temporalVersion } from './versions';

export const refresh = writable(0);

export const workerCount = writable({
  count: 0,
  newCount: 0,
});

export const workerCountEnabled = derived(
  [isCloud, temporalVersion],
  ([$isCloud, $temporalVersion]) =>
    $isCloud || minimumVersionRequired('1.31.2', $temporalVersion),
);
