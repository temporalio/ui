import { noop } from 'svelte/internal';
import { vi } from 'vitest';
import i18next from 'i18next';
import Backend, { FsBackendOptions } from 'i18next-fs-backend';
import { I18nNamespaces } from './src/lib/i18n';

i18next.use(Backend).init<FsBackendOptions>({
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
    loadPath: 'static/i18n/locales/{{lng}}/{{ns}}.json',
  },
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
