import type { WorkflowExecution } from '$lib/types/workflows';

/** Details and request state for the selected workflow execution. */
export type ExecutionDetailsState = Readonly<{
  details: WorkflowExecution | null;
  loading: boolean;
  error: string | null;
}>;
