import { page } from '$app/stores';
import { derived } from 'svelte/store';
import UrlPattern from 'url-pattern';

const pattern = new UrlPattern(
  '/namespaces/:namespace/workflows/:executionId/:runId/:view(/*)',
);

export const isFullScreen = derived(page, ($page) => {
  return !!pattern.match($page.path);
});
