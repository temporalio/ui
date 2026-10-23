import i18next from 'i18next';
import { afterEach, beforeEach, vi } from 'vitest';

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

const cryptoMock = {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
};

vi.stubGlobal('crypto', cryptoMock);

const animateShim = function () {
  const animation = {
    currentTime: 0,
    effect: null,
    playState: 'finished',
    onfinish: null as (() => void) | null,
    cancel: () => {
      animation.onfinish = null;
    },
  };
  queueMicrotask(() => animation.onfinish?.());
  return animation as unknown as Animation;
};

if (typeof Element !== 'undefined') {
  beforeEach(() => {
    if (typeof Element.prototype.animate !== 'function') {
      Object.defineProperty(Element.prototype, 'animate', {
        configurable: true,
        writable: true,
        value: animateShim,
      });
    }
  });

  afterEach(() => {
    if (Element.prototype.animate === animateShim) {
      delete (Element.prototype as { animate?: unknown }).animate;
    }
  });
}

vi.mock('esm-env', () => {
  const BROWSER = true;
  const DEV = false;
  return { BROWSER, DEV };
});
