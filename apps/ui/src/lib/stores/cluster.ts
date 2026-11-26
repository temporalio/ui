import { derived } from 'svelte/store';

import { page } from '$app/stores';

export const cluster = derived([page], ([$page]) => {
  return $page.data?.cluster;
});
