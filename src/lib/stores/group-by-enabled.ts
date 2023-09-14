import { derived } from 'svelte/store';

import { page } from '$app/stores';

export const groupByCountEnabled = derived([page], ([$page]) => {
  console.log('systemInfo: ', $page.data?.systemInfo);
  return true;
  // return (
  //   $page.data?.settings?.runtimeEnvironment?.isCloud ||
  //   $page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus
  // );
});
