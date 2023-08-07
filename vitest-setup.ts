import { noop } from 'svelte/internal';

import i18next from 'i18next';
import { vi } from 'vitest';

import { I18nNamespaces } from './src/lib/i18n';
import resources from './src/lib/i18n/locales';

i18next.init({
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

const BroadcastChannelMock = vi.fn(() => ({
  addEventListener: noop,
  postMessage: noop,
}));

vi.stubGlobal('BroadcastChannel', BroadcastChannelMock);

vi.mock('esm-env', () => {
  const BROWSER = true;
  return { BROWSER };
});
