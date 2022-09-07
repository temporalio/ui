import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';
import { withLoading } from '../utilities/stores/with-loading';
import { fetchWorkflow } from '../services/workflow-service';
import { getPollers } from '../services/pollers-service';
import { decodeURIForSvelte } from '../utilities/encode-uri';
export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const workflowId = derived([page], ([$page]) => $page.params.workflow);
const runId = derived([page], ([$page]) => $page.params.run);
const parameters = derived([namespace, workflowId, runId, refresh], ([$namespace, $workflowId, $runId, $refresh]) => {
    return {
        namespace: $namespace,
        workflowId: decodeURIForSvelte($workflowId !== null && $workflowId !== void 0 ? $workflowId : ''),
        runId: $runId,
        refresh: $refresh,
    };
});
const initialWorkflowRun = { workflow: null, workers: null };
const updateWorkflowRun = (set) => {
    return parameters.subscribe(({ namespace, workflowId, runId }) => {
        if (namespace && workflowId && runId) {
            withLoading(loading, updating, async () => {
                const workflow = await fetchWorkflow({ namespace, workflowId, runId });
                const { taskQueue } = workflow;
                const workers = await getPollers({ queue: taskQueue, namespace });
                set({ workflow, workers });
            });
        }
        else {
            loading.set(true);
            updating.set(false);
        }
    });
};
export const updating = writable(true);
export const loading = writable(true);
export const workflowRun = readable(initialWorkflowRun, updateWorkflowRun);
