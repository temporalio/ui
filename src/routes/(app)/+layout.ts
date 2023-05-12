import { redirect } from '@sveltejs/kit';
import type { LayoutLoad, LayoutData } from './$types';
import type { GetClusterInfoResponse } from '$lib/types';
import i18next from 'i18next';
import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import '$lib/vendor/prism/prism.css';
import '$lib/vendor/prism/prism.cjs';

import '../../app.css';

import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser, setAuthUser } from '$lib/stores/auth-user';
import { fetchCluster } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';
import { fetchLatestUiVersion } from '$lib/services/github-service';
import { fetchSearchAttributes } from '$lib/services/search-attributes-service';
import { isAuthorized } from '$lib/utilities/is-authorized';
import { routeForLoginPage } from '$lib/utilities/route-for';
import {
  getAuthUserCookie,
  cleanAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import type { Settings, UiVersionInfo } from '$lib/types/global';
import { createStore } from '$lib/i18n/store';
import { get } from 'svelte/store';

export const load: LayoutLoad = async function ({
  fetch,
}): Promise<LayoutData> {
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init<HttpBackendOptions>({
      fallbackLng: 'en',
      debug: true,
      load: 'languageOnly',
      ns: 'common',
      defaultNS: 'common',
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: 'locale',
      },
      backend: {
        loadPath: '/i18n/{{lng}}/{{ns}}.json',
      },
    });

  const { i18n } = createStore(i18next);

  const settings: Settings = await fetchSettings(fetch);

  const authUser = getAuthUserCookie();
  if (authUser?.accessToken) {
    setAuthUser(authUser);
    cleanAuthUserCookie();
  }

  const user = getAuthUser();

  if (!isAuthorized(settings, user)) {
    throw redirect(302, routeForLoginPage());
  }

  fetchNamespaces(settings, fetch);
  fetchSearchAttributes(settings, fetch);

  const cluster: GetClusterInfoResponse = await fetchCluster(settings, fetch);

  const uiVersionInfo: UiVersionInfo = {
    current: settings.version,
    recommended: settings.notifyOnNewVersion
      ? await fetchLatestUiVersion(fetch)
      : undefined,
  };

  return {
    user,
    uiVersionInfo,
    settings,
    cluster,
    i18n: () => get(i18n),
  };
};
