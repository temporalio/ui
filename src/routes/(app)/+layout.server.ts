import type { LayoutServerLoad } from './$types';

import { HttpApi } from '$lib/utilities/http-api';

export const load: LayoutServerLoad = async () => {
  const settings = await HttpApi.settings();
  const namespaces = await HttpApi.namespaces();
  const cluster = await HttpApi.cluster();
  const systemInfo = await HttpApi.system();

  return {
    settings,
    namespaces,
    cluster,
    systemInfo,
  };
};
