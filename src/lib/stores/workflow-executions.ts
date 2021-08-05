import { actions } from '$lib/state/features/workflow-executions';
import { createStore } from '$lib/utilities/create-store';

export const workflowExecutions = createStore(
  (state) => state.workflowExecutions.workflows,
  actions,
  () => actions.fetchWorkflows(),
);
