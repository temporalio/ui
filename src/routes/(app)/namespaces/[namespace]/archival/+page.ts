import type { PageLoad } from './$types';

import { fetchNamespace } from '$lib/services/namespaces-service';
import type { DescribeNamespaceResponse } from '$lib/types';

export const load: PageLoad = async function ({ params }) {
  const namespace: DescribeNamespaceResponse = await fetchNamespace(
    params.namespace,
  );
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

  return {
    namespace,
    archivalEnabled,
    visibilityArchivalEnabled,
    archivalQueryingSupported,
  };
};
