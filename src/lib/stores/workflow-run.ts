import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { withLoading } from '$lib/utilities/stores/with-loading';
import type { StartStopNotifier } from 'svelte/store';
import { fetchWorkflow } from '$lib/services/workflow-service';
import { getPollers } from '$lib/services/pollers-service';
import type { GetPollersResponse } from '$lib/services/pollers-service';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { toDecodedPendingActivities } from '$lib/models/pending-activities';

export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const workflowId = derived([page], ([$page]) => $page.params.workflow);
const runId = derived([page], ([$page]) => $page.params.run);
const settings = derived([page], ([$page]) => $page.stuff.settings);

const parameters = derived(
  [namespace, workflowId, runId, settings, refresh],
  ([$namespace, $workflowId, $runId, $settings, $refresh]) => {
    return {
      namespace: $namespace,
      workflowId: decodeURIForSvelte($workflowId ?? ''),
      runId: $runId,
      settings: $settings,
      refresh: $refresh,
    };
  },
);

type WorkflowRunStore = {
  workflow: WorkflowExecution | null;
  workers: GetPollersResponse | null;
};
const initialWorkflowRun: WorkflowRunStore = { workflow: null, workers: null };

const updateWorkflowRun: StartStopNotifier<{
  workflow: WorkflowExecution;
  workers: GetPollersResponse;
}> = (set) => {
  return parameters.subscribe(({ namespace, workflowId, runId, settings }) => {
    if (namespace && workflowId && runId) {
      withLoading(loading, updating, async () => {
        const workflow = await fetchWorkflow({ namespace, workflowId, runId });
        const { taskQueue } = workflow;
        const workers = await getPollers({ queue: taskQueue, namespace });
        workflow.pendingActivities = await toDecodedPendingActivities(
          workflow,
          namespace,
          settings,
        );

        set({ workflow, workers });
      });
    } else {
      loading.set(true);
      updating.set(false);
    }
  });
};

export const updating = writable(true);
export const loading = writable(true);
export const workflowRun = readable<WorkflowRunStore>(
  initialWorkflowRun,
  updateWorkflowRun,
);
