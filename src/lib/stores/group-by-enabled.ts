import { derived } from 'svelte/store';

import { page } from '$app/stores';

export const groupByCountEnabled = derived([page], ([$page]) => {
  return Boolean(
    $page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus,
  );
});
