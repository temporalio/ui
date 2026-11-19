import i18next from 'i18next';
import { flushSync, mount, unmount } from 'svelte';

import { i18nNamespaces } from '$lib/i18n';
import resources from '$lib/i18n/locales';
import type { NamespaceFairness } from '$lib/stores/namespace-fairness';
import { namespaceFairness } from '$lib/stores/namespace-fairness';

import FairnessKey from './fairness-key.svelte';

const mounted: ReturnType<typeof mount>[] = [];

export async function initialize() {
  await i18next.init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: i18nNamespaces,
    defaultNS: 'common',
    resources,
  });
}

export async function cleanup() {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  namespaceFairness.set({ enabled: undefined });
  document.body.replaceChildren();
}

export function setNamespaceFairness(value: NamespaceFairness) {
  namespaceFairness.set(value);
  flushSync();
}

export function render(fairnessKey = 'payments') {
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(mount(FairnessKey, { target, props: { fairnessKey } }));
  flushSync();
  return target;
}

export function flush() {
  flushSync();
}
