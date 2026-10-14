import type { WorkflowEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

/** Optional scope for an embedded run, whose identity differs from the route. */
export const WORKFLOW_VIEW_CONTEXT = Symbol('workflow-view');
export type WorkflowViewContext = {
  readonly namespace: string;
  readonly workflow: WorkflowExecution;
  readonly events: WorkflowEvent[];
};
