import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { withLoading } from '$lib/utilities/stores/with-loading';
import type { StartStopNotifier } from 'svelte/store';
import { fetchWorkflow } from '$lib/services/workflow-service';
import { getPollers } from '$lib/services/pollers-service';
import type { GetPollersResponse } from '$lib/services/pollers-service';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { toDecodedPendingActivities } from '$lib/models/pending-activities';
import { authUser } from '$lib/stores/auth-user';
import { loading } from '$lib/stores/workflow-run-loading';

export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const workflowId = derived([page], ([$page]) => $page.params.workflow);
const runId = derived([page], ([$page]) => $page.params.run);
const settings = derived([page], ([$page]) => $page.data?.settings);
const accessToken = derived(
  [authUser],
  ([$authUser]) => $authUser?.accessToken,
);

const parameters = derived(
  [namespace, workflowId, runId, settings, accessToken, refresh],
  ([$namespace, $workflowId, $runId, $settings, $accessToken, $refresh]) => {
    return {
      namespace: $namespace,
      workflowId: decodeURIForSvelte($workflowId ?? ''),
      runId: $runId,
      settings: $settings,
      accessToken: $accessToken,
      refresh: $refresh,
    };
  },
);

type WorkflowRunStore = {
  workflow: WorkflowExecution | null;
  workers: GetPollersResponse | null;
};
const initialWorkflowRun: WorkflowRunStore = { workflow: null, workers: null };

export const updating = writable(true);
export const workflowRun = writable<WorkflowRunStore>(initialWorkflowRun);
