import { redirect } from '@sveltejs/kit';

import type { LayoutData, LayoutLoad } from './$types';

import { fetchCluster, fetchSystemInfo } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';
import { fetchSettings } from '$lib/services/settings-service';
import { clearAuthUser, getAuthUser } from '$lib/stores/auth-user';
import type { GetClusterInfoResponse, GetSystemInfoResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';
import { isAuthorized } from '$lib/utilities/is-authorized';
import { routeForLoginPage } from '$lib/utilities/route-for';

import '../../app.css';

export const load: LayoutLoad = async function ({
  fetch,
}): Promise<LayoutData> {
  const settings: Settings = await fetchSettings(fetch);

  if (!settings.auth.enabled) {
    clearAuthUser();
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
