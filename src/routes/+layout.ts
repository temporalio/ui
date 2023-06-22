import type { LayoutData, LayoutLoad } from './$types';
import i18next from 'i18next';
import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18nNamespaces } from '$lib/i18n';

export const ssr = false;

export const load: LayoutLoad = function (): LayoutData {
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init<HttpBackendOptions>({
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
      backend: {
        loadPath: '/i18n/locales/{{lng}}/{{ns}}.json',
      },
    });
};
