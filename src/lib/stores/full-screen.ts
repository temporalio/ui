import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const isFullScreen = derived(page, ($page) => {
  const { query } = $page;
  if (!query.has('fullScreen')) return false;
  if (query.get('fullScreen') === 'false') return false;
  return true;
});
