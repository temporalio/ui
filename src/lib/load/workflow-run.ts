import type { LoadEvent } from "@sveltejs/kit";
import { toDecodedPendingActivities } from "$lib/models/pending-activities";
import { getPollers } from "$lib/services/pollers-service";
import { fetchWorkflow } from "$lib/services/workflow-service";

export const getWorkflowWithWorkers = async ({ params, parent }: Partial<LoadEvent>) => {
  const { namespace, workflow: workflowId, run: runId } = params;
  const { settings } = await parent();
  const workflow = await fetchWorkflow({ namespace, workflowId, runId });
  const { taskQueue } = workflow;
  const workers = await getPollers({ queue: taskQueue, namespace });
  workflow.pendingActivities = await toDecodedPendingActivities(
    workflow,
    namespace,
    settings,
    '',
  );

  return { workflow, workers };
}
