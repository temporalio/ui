import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/svelte';
import i18next from 'i18next';
import { afterEach, vi } from 'vitest';

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

afterEach(() => {
  cleanup();
});

vi.mock('esm-env', () => {
  const BROWSER = true;
  return { BROWSER };
});
