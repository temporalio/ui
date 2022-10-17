import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from '@sveltejs/kit';
import type { ListNamespacesResponse, GetClusterInfoResponse } from '$types';

import '../app.css';

import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser, setAuthUser } from '$lib/stores/auth-user';
import { fetchCluster } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';
import { fetchLatestUiVersion } from '$lib/services/github-service';
import { fetchSearchAttributes } from '$lib/services/search-attributes-service';
import { getDefaultNamespace } from '$lib/utilities/get-namespace';
import { isAuthorized } from '$lib/utilities/is-authorized';
import { routeForLoginPage } from '$lib/utilities/route-for';
import {
  getAuthUserCookie,
  cleanAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';

export const load: LayoutLoad.root = async function ({ fetch }) {
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

  const namespacesResp: ListNamespacesResponse = await fetchNamespaces(
    settings,
    fetch,
  );

  const defaultNamespace: string = getDefaultNamespace({
    namespaces: namespacesResp?.namespaces,
    settings,
  });

  const cluster: GetClusterInfoResponse = await fetchCluster(settings, fetch);

  fetchSearchAttributes(settings);

  const uiVersionInfo: UiVersionInfo = {
    current: settings.version,
    recommended: settings.notifyOnNewVersion
      ? await fetchLatestUiVersion(fetch)
      : undefined,
  };

  return {
    user,
    uiVersionInfo,
    namespaces: namespacesResp?.namespaces,
    settings: { ...settings, defaultNamespace },
    cluster,
  };
};
