import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { fetchSettings } from '$lib/services/settings-service';
import { fetchUser } from '$lib/services/user-service';
import { fetchCluster } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';


import type {
  ListNamespacesResponse,
} from '$types';

export async function get({ params, url }) {
  const settings: Settings = await fetchSettings({ url }, fetch);
  const { namespaces }: ListNamespacesResponse = await fetchNamespaces(
    settings,
    fetch,
  );
  const user = await fetchUser(fetch);
  const cluster = await fetchCluster(settings, fetch);

  return {
    body: { settings, namespaces, user, cluster },
  };
};

