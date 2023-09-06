import { derived } from 'svelte/store';

import { page } from '$app/stores';

export const groupByCountEnabled = derived([page], ([$page]) => {
  return (
    $page.data?.settings?.runtimeEnvironment?.isCloud ||
    $page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus
  );
});
