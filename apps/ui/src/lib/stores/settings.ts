import { derived } from 'svelte/store';

import { page } from '$app/stores';

export const settings = derived([page], ([$page]) => $page.data.settings);
