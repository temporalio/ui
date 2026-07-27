import type { PageLoad } from './$types';

import { fetchAllEvents } from '$lib/services/events-service';

export const load: PageLoad = async function ({ params }) {
  const { namespace, workflow: workflowId, run: runId } = params;

  const fetchHistory = fetchAllEvents({
    namespace,
    workflowId,
    runId,
    sort: 'ascending',
  });

  return {
    fetchHistory,
  };
};
