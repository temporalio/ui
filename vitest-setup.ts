import i18next from 'i18next';
import { vi } from 'vitest';

import { i18nNamespaces } from './src/lib/i18n';
import resources from './src/lib/i18n/locales';

i18next.init({
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

const BroadcastChannelMock = vi.fn(() => ({
  addEventListener: () => {},
  postMessage: () => {},
}));

vi.stubGlobal('BroadcastChannel', BroadcastChannelMock);

vi.mock('esm-env', async (importOriginal) => {
  const actual = (await importOriginal()) as { BROWSER: boolean; ENV: boolean };
  const BROWSER = true;
  return { ...actual, BROWSER };
});
