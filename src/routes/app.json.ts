import { fetchSettings } from '$lib/services/settings-service';
import { fetchUser } from '$lib/services/user-service';
import { fetchCluster } from '$lib/services/cluster-service';
import { fetchNamespaces } from '$lib/services/namespaces-service';

import type { ListNamespacesResponse, GetClusterInfoResponse } from '$types';

export async function get({ url }): Promise<RequestOutput> {
  const [user, settings]: [User, Settings] = await Promise.all([
    fetchUser(),
    fetchSettings({ url }, fetch),
  ]);
  const [{ namespaces }, cluster]: [
    ListNamespacesResponse,
    GetClusterInfoResponse,
  ] = await Promise.all([fetchNamespaces(settings), fetchCluster(settings)]);

  return {
    body: { settings, namespaces, user, cluster },
  };
}
