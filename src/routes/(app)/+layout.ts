import { redirect } from '@sveltejs/kit';
import { InvalidTokenError, jwtDecode, type JwtPayload } from 'jwt-decode';
import lscache from 'lscache';

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
  routeForImplicitFlow,
  routeForLoginPage,
} from '$lib/utilities/route-for';

import '../../app.css';

lscache.flushExpired();

/**
 *
 * @modifies removes the nonce and state from localStorage
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
  }

  if (!settings.auth.enabled) {
    clearAuthUser(); // prevent stale local storage values being passed down
  }

  const user = getAuthUser();

  // hello hackness my old friend
  // i've come to auth with you again
  // because a session softly stale-ing
  // left itself while devs were sleeping
  // and the token that was planted yesterday
  // still remains
  // within the sound of login
  //
  // 🎵 to the tune of "The Sound of Silence" 🎵
  //
  // save the redirect and the click through the login page, iff there is an expired id token.
  // the login page is still used to display auth errors (e.g. UI proxy)
  if (user?.idToken) {
    let token: JwtPayload;
    try {
      token = jwtDecode(user.idToken);
    } catch (e) {
      if (e instanceof InvalidTokenError) {
        clearAuthUser();
      }

      throw e;
    }

    if (token?.exp && token.exp * 1000 <= Date.now()) {
      clearAuthUser();
      const location = new URL(document.location.toString());
      redirect(
        302,
        routeForImplicitFlow(settings, location.searchParams, location.origin),
      );
    }
  }

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
