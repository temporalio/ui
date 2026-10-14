import { getContext } from 'svelte';

import type { WorkflowEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

/** Optional scope for an embedded run, whose identity differs from the route. */
export const WORKFLOW_VIEW_CONTEXT = Symbol('workflow-view');
export type WorkflowViewContext = {
  readonly namespace: string;
  readonly workflow: WorkflowExecution;
  readonly events: WorkflowEvent[];
};

export const getWorkflowViewContext = () =>
  getContext<WorkflowViewContext | undefined>(WORKFLOW_VIEW_CONTEXT);

export type WorkflowRouteIdentity = {
  namespace: string;
  workflow: string;
  run: string;
};

export const workflowIdentity = (
  scope: WorkflowViewContext | undefined,
  params: Record<string, string>,
): WorkflowRouteIdentity =>
  scope
    ? {
        namespace: scope.namespace,
        workflow: scope.workflow.id,
        run: scope.workflow.runId,
      }
    : {
        namespace: params.namespace,
        workflow: params.workflow,
        run: params.run,
      };
