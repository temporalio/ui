import { redirect } from '@sveltejs/kit';

import type { LayoutData, LayoutLoad } from './$types';

import { fetchCluster, fetchSystemInfo } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';
import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser, setAuthUser } from '$lib/stores/auth-user';
import type { GetClusterInfoResponse, GetSystemInfoResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';
import { OIDCFlow } from '$lib/types/global';
import {
  cleanAuthUserCookie,
  getAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import { isAuthorized } from '$lib/utilities/is-authorized';
import {
  OIDCImplicitCallbackError,
  routeForLoginPage,
  routeForOIDCImplicitCallback,
} from '$lib/utilities/route-for';

import '../../app.css';

/**
 *
 * @modifies removes items from browser localStorage and sessionStorage
 * @modifies url hash
 * @throws {Redirect} to address auth and login state
 *
 */
export const load: LayoutLoad = async function ({
  fetch,
}): Promise<LayoutData> {
  const settings: Settings = await fetchSettings(fetch);

  if (settings.auth.flow == OIDCFlow.AuthorizationCode) {
    const authUser = getAuthUserCookie();
    if (authUser?.accessToken) {
      setAuthUser(authUser, settings.auth.flow);
      cleanAuthUserCookie();
    }
  } else if (settings.auth.flow == OIDCFlow.Implicit && window.location.hash) {
    let route: string;
    try {
      route = routeForOIDCImplicitCallback();
    } catch (e) {
      if (!(e instanceof OIDCImplicitCallbackError)) {
        throw e;
      }
    } finally {
      // side effect: clear the hash from the URL
      // known oidc sveltekit issue https://github.com/sveltejs/kit/issues/7271
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    }

    if (route) {
      redirect(302, route);
    }
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
