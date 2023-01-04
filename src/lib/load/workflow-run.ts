import type { LoadEvent } from '@sveltejs/kit';
import { toDecodedPendingActivities } from '$lib/models/pending-activities';
import { getPollers } from '$lib/services/pollers-service';
import { fetchWorkflow } from '$lib/services/workflow-service';

export const getWorkflowWithWorkers = async ({
  params,
  parent,
  fetch,
}: Partial<LoadEvent>) => {
  const { namespace, workflow: workflowId, run: runId } = params;
  const { settings, user } = await parent();
  const workflow = await fetchWorkflow({ namespace, workflowId, runId }, fetch);
  const { taskQueue } = workflow;
  const workers = await getPollers({ queue: taskQueue, namespace }, fetch);
  workflow.pendingActivities = await toDecodedPendingActivities(
    workflow,
    namespace,
    settings,
    user?.accessToken,
  );

  return { workflow, workers };
};
