import type { TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

export const getWorkerDeploymentName = (
  workers: TaskQueueResponse | undefined,
  workflow: WorkflowExecution | null | undefined,
): string | undefined =>
  workers?.versioningInfo?.currentDeploymentVersion?.deploymentName ||
  workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'] ||
  undefined;
