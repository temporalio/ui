import type { WorkflowExecution } from '$lib/models/workflow-execution';

import {
  mergeSearchParams,
  toSearchParams,
  URLSearchParamLike,
} from './url-search-params';

export const getWorkflowExecutionUrl = (
  workflow: WorkflowExecution,
  query?: URLSearchParamLike,
  queryOverrides?: URLSearchParamLike,
) => {
  const url = `/workflows/${workflow.id}/${workflow.runId}`;

  const search = queryOverrides
    ? mergeSearchParams(toSearchParams(query), toSearchParams(queryOverrides))
    : toSearchParams(query);

  return query ? `${url}?${search}` : `${url}`;
};
