import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import type { LayoutData, LayoutLoad } from './$types';

import { I18nNamespaces } from '$lib/i18n';

export const ssr = false;

export const load: LayoutLoad = async function (): LayoutData {
  const locales = import.meta.glob('/src/lib/i18n/locales/*/*.ts');

  const resources = {};

  for (const key in locales) {
    const [_, lang] = key.split(/\/src\/lib\/i18n\/locales\/(\w+)\/.+\.ts/);
    if (!resources[lang]) {
      resources[lang] = {};
    }

    const { Strings, Namespace } = (await locales[key]()) as {
      Strings: object;
      Namespace: string;
    };

    resources[lang] = {
      ...resources[lang],
      [Namespace]: Strings,
    };
  }

  i18next.use(LanguageDetector).init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: I18nNamespaces,
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
