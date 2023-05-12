import type { i18n } from 'i18next';
import { writable, derived, type Readable } from 'svelte/store';

type TranslateService = {
  i18n: Readable<i18n>;
};

export const createStore = (i18n: i18n): TranslateService => {
  const i18nWritable = writable<i18n>(i18n);

  i18n.on('initialized', () => {
    i18nWritable.set(i18n);
  });

  i18n.on('loaded', () => {
    i18nWritable.set(i18n);
  });

  i18n.on('added', () => {
    i18nWritable.set(i18n);
  });

  i18n.on('languageChanged', () => {
    i18nWritable.set(i18n);
  });

  return {
    i18n: derived(i18nWritable, ($i18n) => $i18n),
  };
};
