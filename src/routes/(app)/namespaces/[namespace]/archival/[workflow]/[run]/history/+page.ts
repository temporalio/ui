import type { PageLoad } from './$types';

import { fetchAllEvents } from '$lib/services/events-service';
import { fetchNamespace } from '$lib/services/namespaces-service';
import type { DescribeNamespaceResponse } from '$lib/types';

export const load: PageLoad = async function ({ params }) {
  const { namespace: ns, workflow: workflowId, run: runId } = params;
  const namespace: DescribeNamespaceResponse = await fetchNamespace(ns);
  const isS3Bucket = namespace.config?.historyArchivalUri
    ?.toLowerCase()
    ?.startsWith('s3://');
  const isGSBucket = namespace.config?.historyArchivalUri
    ?.toLowerCase()
    ?.startsWith('gs://');
  const archivalQueryingSupported = !isS3Bucket && !isGSBucket;

  const archivalEnabled =
    (namespace?.config?.historyArchivalState as unknown as string) ===
    'Enabled';

  const visibilityArchivalEnabled =
    (namespace?.config?.visibilityArchivalState as unknown as string) ===
    'Enabled';

  const fetchHistory = fetchAllEvents({
    namespace: ns,
    workflowId,
    runId,
    sort: 'ascending',
  });

  return {
    namespace,
    archivalEnabled,
    visibilityArchivalEnabled,
    archivalQueryingSupported,
    fetchHistory,
  };
};
