import { browser } from '$app/env';
import { page } from '$app/stores';
import { derived } from 'svelte/store';
import UrlPattern from 'url-pattern';

const pattern = new UrlPattern('/namespaces/:namespace/*');
const onlyInBrowser = <T>(fn: () => T): T => {
  if (browser) return fn();
};

export const namespace = derived(page, ($page) => {
  const match = pattern.match($page.path);
  const namespace =
    onlyInBrowser<string>(
      () => localStorage.getItem('currentNamespace') || 'default',
    ) || 'default';

  if (match) {
    onlyInBrowser<void>(() =>
      localStorage.setItem('currentNamespace', match.namespace),
    );
    return match.namespace;
  }

  return namespace;
});
