import { fetchNexusEndpoints } from '$lib/services/nexus-service.js';

import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ fetch }) => {
  const endpoints = await fetchNexusEndpoints(fetch);
  console.log('endpoints', endpoints);
  return {
    endpoints,
  };
};
