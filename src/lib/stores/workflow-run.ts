import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { withLoading } from '$lib/utilities/stores/with-loading';
import type { StartStopNotifier } from 'svelte/store';
import { fetchWorkflow } from '$lib/services/workflow-service';
import { getPollers } from '$lib/services/pollers-service';
import type { GetPollersResponse } from '$lib/services/pollers-service';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const workflowId = derived([page], ([$page]) => $page.params.workflow);
const runId = derived([page], ([$page]) => $page.params.run);

const parameters = derived(
  [namespace, workflowId, runId, refresh],
  ([$namespace, $workflowId, $runId, $refresh]) => {
    return {
      namespace: $namespace,
      workflowId: decodeURIForSvelte($workflowId ?? ''),
      runId: $runId,
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
  return parameters.subscribe(({ namespace, workflowId, runId, refresh }) => {
    if (namespace && workflowId && runId) {
      withLoading(loading, updating, async () => {
        const workflow = await fetchWorkflow({ namespace, workflowId, runId });
        const { taskQueue } = workflow;
        const workers = await getPollers({ queue: taskQueue, namespace });
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
