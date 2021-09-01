import { page } from '$app/stores';
import { derived } from 'svelte/store';
import UrlPattern from 'url-pattern';

const pattern = new UrlPattern('/namespaces/:namespace/*');

export const namespace = derived(page, ($page) => {
  const match = pattern.match($page.path);
  const namespace = localStorage.getItem('currentNamespace') || 'default';

  if (match) {
    localStorage.setItem('currentNamespace', match.namespace);
    return match.namespace;
  }

  return namespace;
});
