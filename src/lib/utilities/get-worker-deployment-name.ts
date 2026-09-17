import type { TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

// The search attribute records the deployment the workflow runs on, so it
// comes first. A pinned workflow keeps its deployment after the task queue's
// current version moves to another one. The server only writes the attribute
// once a versioned worker completes the first workflow task, so before that
// the task queue's current version fills the gap: it is a property of the
// queue, present with zero pollers, and it is the deployment a new execution
// will run on.
export const getWorkerDeploymentName = (
  workers: TaskQueueResponse | undefined,
  workflow: WorkflowExecution | null | undefined,
): string | undefined =>
  workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'] ||
  workers?.versioningInfo?.currentDeploymentVersion?.deploymentName ||
  undefined;
