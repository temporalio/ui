import { derived } from 'svelte/store';

import { page } from '$app/stores';

export const groupByCountEnabled = derived([page], ([$page]) => {
  return $page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus;
});
