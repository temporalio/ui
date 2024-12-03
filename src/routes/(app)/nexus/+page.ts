import { fetchNexusEndpoints } from '$lib/services/nexus-service.js';

import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { systemInfo } = await parent();
  const nexusEnabled = systemInfo?.capabilities?.nexus;
  if (!nexusEnabled) {
    return {
      endpoints: []
    }
  }

  const search = url.searchParams.get('search') || '';
  const endpoints = await fetchNexusEndpoints(search, fetch);
  return {
    endpoints,
  };
};
