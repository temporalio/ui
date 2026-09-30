import i18next from 'i18next';

import { i18nNamespaces } from '$lib/i18n';
import resources from '$lib/i18n/locales';

let initialized: Promise<unknown> | undefined;

/** Idempotent i18n bootstrap for Host-facing components. Not part of the public API. */
export function ensureI18n(): Promise<unknown> {
  initialized ??= i18next.init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: i18nNamespaces,
    defaultNS: 'common',
    resources,
  });
  return initialized;
}
