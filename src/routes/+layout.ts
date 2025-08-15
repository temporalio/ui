import { redirect } from '@sveltejs/kit';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import lscache from 'lscache';

import type { LayoutData, LayoutLoad } from './$types';

import { i18nNamespaces } from '$lib/i18n';
import resources from '$lib/i18n/locales';
import { fetchSettings } from '$lib/services/settings-service';
import { setAuthUser } from '$lib/stores/auth-user';
import type { Settings } from '$lib/types/global';
import { OIDCFlow } from '$lib/types/global';
import {
  maybeRouteForOIDCImplicitCallback,
  type OIDCCallback,
  OIDCImplicitCallbackError,
} from '$lib/utilities/route-for';

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

  const settings: Settings = await fetchSettings(fetch);

  if (settings.auth.flow == OIDCFlow.Implicit && window.location.hash) {
    let callback: OIDCCallback;
    try {
      callback = maybeRouteForOIDCImplicitCallback(window.location.hash);
    } catch (e) {
      if (e instanceof OIDCImplicitCallbackError) {
        clearHash();
      } else {
        throw e;
      }
    }

    if (callback) {
      clearHash();
      const { redirectUrl: url, authUser, stateKey } = callback;

      setAuthUser(authUser, settings.auth.flow);
      localStorage.removeItem('nonce');
      if (stateKey) {
        lscache.flush();
      }

      redirect(302, url);
    }
  }
};

/**
 *
 * @modifies drops the url hash
 *
 */
function clearHash() {
  // known oidc sveltekit issue https://github.com/sveltejs/kit/issues/7271
  history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  );
}
