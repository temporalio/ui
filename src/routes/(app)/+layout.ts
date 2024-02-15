import { redirect } from '@sveltejs/kit';

import type { LayoutData, LayoutLoad } from './$types';

import { fetchCluster, fetchSystemInfo } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';
import { fetchSettings } from '$lib/services/settings-service';
import { clearAuthUser, getAuthUser, setAuthUser } from '$lib/stores/auth-user';
import type { GetClusterInfoResponse, GetSystemInfoResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';
import { OIDCFlow } from '$lib/types/global';
import {
  cleanAuthUserCookie,
  getAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import { isAuthorized } from '$lib/utilities/is-authorized';
import {
  maybeRouteForOIDCImplicitCallback,
  type OIDCCallback,
  OIDCImplicitCallbackError,
  routeForLoginPage,
} from '$lib/utilities/route-for';

import '../../app.css';

/**
 *
 * @modifies removes the nonce from localStorage and the state from sessionStorage
 * @modifies drops the url hash fragment
 * @throws {Redirect} to address auth and login state
 *
 */
export const load: LayoutLoad = async function ({
  fetch,
}): Promise<LayoutData> {
  const settings: Settings = await fetchSettings(fetch);

  if (!settings.auth.enabled) {
    cleanAuthUserCookie();
    clearAuthUser();
  }

  if (settings.auth.flow == OIDCFlow.AuthorizationCode) {
    const authUser = getAuthUserCookie();
    if (authUser?.accessToken) {
      setAuthUser(authUser, settings.auth.flow);
      cleanAuthUserCookie();
    }
  } else if (settings.auth.flow == OIDCFlow.Implicit && window.location.hash) {
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
        sessionStorage.removeItem(stateKey);
      }

      redirect(302, url);
    }
  }

  if (!settings.auth.enabled) {
    clearAuthUser(); // prevent stale local storage values being passed down
  }

  const user = getAuthUser();

  if (!isAuthorized(settings, user)) {
    redirect(302, routeForLoginPage());
  }

  fetchNamespaces(settings, fetch);

  const cluster: GetClusterInfoResponse = await fetchCluster(settings, fetch);
  const systemInfo: GetSystemInfoResponse = await fetchSystemInfo(
    settings,
    fetch,
  );

  return {
    user,
    settings,
    cluster,
    systemInfo,
  };
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
