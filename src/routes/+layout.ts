import { get } from 'svelte/store';
import type { LayoutData, LayoutLoad } from './$types';
import i18next from 'i18next';
import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { createStore } from '$lib/i18n/store';

export const ssr = false;

export const load: LayoutLoad = function (): LayoutData {
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init<HttpBackendOptions>({
      fallbackLng: 'en',
      load: 'languageOnly',
      ns: 'common',
      defaultNS: 'common',
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: 'locale',
      },
      backend: {
        loadPath: '/i18n/locales/{{lng}}/{{ns}}.json',
      },
    });

  const { i18n } = createStore(i18next);

  return {
    i18n: () => get(i18n),
  };
};
