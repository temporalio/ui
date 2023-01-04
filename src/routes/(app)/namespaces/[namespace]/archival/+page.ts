import type { PageLoad } from './$types';
import {
  fetchAllArchivedWorkflows,
  type CombinedWorkflowExecutionsResponse,
} from '$lib/services/workflow-service';
import { fetchNamespace } from '$lib/services/namespaces-service';
import type { DescribeNamespaceResponse } from '$types';

export const load: PageLoad = async function ({ params, url }) {
  const { searchParams } = url;

  if (!searchParams.has('time-range')) searchParams.set('time-range', '1 day');

  const workflowId = searchParams.get('workflow-id');
  const workflowType = searchParams.get('workflow-type');
  const timeRange = searchParams.get('time-range');
  const executionStatus = searchParams.get('status') as WorkflowStatus;

  const parameters: ArchiveFilterParameters = {
    workflowId,
    workflowType,
    closeTime: timeRange,
    executionStatus,
  };

  const namespace: DescribeNamespaceResponse = await fetchNamespace(
    params.namespace,
  );

  // These are incorrectly typed as enums and need to be coerced to strings
  const archivalEnabled =
    (namespace?.config?.historyArchivalState as unknown as string) ===
    'Enabled';

  const visibilityArchivalEnabled =
    (namespace?.config?.visibilityArchivalState as unknown as string) ===
    'Enabled';

  const initialData: CombinedWorkflowExecutionsResponse | null =
    archivalEnabled && visibilityArchivalEnabled
      ? await fetchAllArchivedWorkflows(params.namespace, parameters, fetch)
      : null;

  return {
    workflows: initialData ? initialData.workflows : [],
    namespace,
    archivalEnabled,
    visibilityArchivalEnabled,
  };
};
