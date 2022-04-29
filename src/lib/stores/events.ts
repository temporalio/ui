import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const eventCategory = derived([page], ([page]) => {
  return page.url.searchParams.get('category');
});
