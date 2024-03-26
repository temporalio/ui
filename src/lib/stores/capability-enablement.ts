import { derived } from 'svelte/store';

import { page } from '$app/stores';

import { minimumVersionRequired } from '$lib/utilities/version-check';

import { temporalVersion } from './versions';

export const groupByCountEnabled = derived([page], ([$page]) => {
  return Boolean(
    $page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus,
  );
});

export const prefixSearchEnabled = derived(
  [page, temporalVersion],
  ([$page, $temporalVersion]) => {
    const serverVersionEnabled = minimumVersionRequired(
      '1.23.0',
      $temporalVersion,
    );
    const capabilitiesEnabled = Boolean(
      $page.data?.systemInfo?.capabilities?.prefixSearch,
    );
    return serverVersionEnabled || capabilitiesEnabled;
  },
);
