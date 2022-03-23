import { fetchAllWorkflows } from '$lib/services/workflow-service';

 export async function get({ params, url }) {
  const isAdvancedSearch = url.searchParams.has('query');

  if (!url.searchParams.has('time-range') && !isAdvancedSearch)
    url.searchParams.set('time-range', '24 hours');

  const namespace = params.namespace;
  const workflowId = url.searchParams.get('workflow-id');
  const workflowType = url.searchParams.get('workflow-type');
  const timeRange = url.searchParams.get('time-range');
  const executionStatus = url.searchParams.get('status') as WorkflowStatus;
  const query = url.searchParams.get('query');

  const parameters: ValidWorkflowParameters = {
    workflowId,
    workflowType,
    timeRange,
    executionStatus,
    query,
  };

  const workflows = await fetchAllWorkflows(namespace, parameters, fetch);

  return {
    body: { workflows, isAdvancedSearch },
  };
};

 