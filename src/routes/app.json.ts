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
  );
  const user = await fetchUser();
  const cluster = await fetchCluster(settings);

  return {
    body: { settings, namespaces, user, cluster },
  };
};

