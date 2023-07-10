import { redirect } from '@sveltejs/kit';

import type { LayoutData, LayoutLoad } from './$types';

import { fetchCluster } from '$lib/services/cluster-service';
import { fetchLatestUiVersion } from '$lib/services/github-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';
import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser, setAuthUser } from '$lib/stores/auth-user';
import type { GetClusterInfoResponse } from '$lib/types';
import type { Settings, UiVersionInfo } from '$lib/types/global';
import {
  cleanAuthUserCookie,
  getAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import { isAuthorized } from '$lib/utilities/is-authorized';
import { routeForLoginPage } from '$lib/utilities/route-for';
import '$lib/vendor/prism/prism.css';
import '$lib/vendor/prism/prism.cjs';

import '../../app.css';

export const load: LayoutLoad = async function ({
  fetch,
}): Promise<LayoutData> {
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
  };
};
