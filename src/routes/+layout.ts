import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import type { LayoutData, LayoutLoad } from './$types';

import { i18nNamespaces } from '$lib/i18n';
import resources from '$lib/i18n/locales';

export const ssr = false;

export const load: LayoutLoad = async function (): LayoutData {
  i18next.use(LanguageDetector).init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: i18nNamespaces,
    defaultNS: 'common',
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'locale',
    },
    resources,
  });
};
