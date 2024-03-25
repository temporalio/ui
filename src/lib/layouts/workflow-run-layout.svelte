<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/stores';

  import WorkflowError from '$lib/components/workflow/workflow-error.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
  import { toDecodedPendingActivities } from '$lib/models/pending-activities';
  import { fetchAllEvents } from '$lib/services/events-service';
  import {
    getPollers,
    getTaskQueueCompatibility,
  } from '$lib/services/pollers-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { authUser } from '$lib/stores/auth-user';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import { fullEventHistory, timelineEvents } from '$lib/stores/events';
  import { labsMode } from '$lib/stores/labs-mode';
  import {
    initialWorkflowRun,
    refresh,
    workflowRun,
  } from '$lib/stores/workflow-run';
  import type { NetworkError } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowHeaderV2 from './workflow-header-v2.svelte';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  let workflowError: NetworkError;
  let eventHistoryController: AbortController;

  const getCompatibility = async (
    workflow: WorkflowExecution,
    taskQueue: string,
  ) => {
    const workflowUsesVersioning =
      workflow?.mostRecentWorkerVersionStamp?.useVersioning;
    if (!workflowUsesVersioning) return;
    return await getTaskQueueCompatibility({
      queue: taskQueue,
      namespace,
    });
  };

  const getWorkflowAndEventHistory = async (
    namespace: string,
    workflowId: string,
    runId: string,
    sort: EventSortOrder,
    labsMode: boolean,
  ) => {
    const { settings } = $page.data;

    const { workflow, error } = await fetchWorkflow({
      namespace,
      workflowId,
      runId,
    });

    if (error) {
      workflowError = error;
      return;
    }

    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue, namespace });
    const compatibility = await getCompatibility(workflow, taskQueue);
    workflow.pendingActivities = await toDecodedPendingActivities(
      workflow,
      namespace,
      settings,
      $authUser?.accessToken,
    );
    $workflowRun = { workflow, workers, compatibility };

    eventHistoryController = new AbortController();
    fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: labsMode ? 'ascending' : sort,
      signal: eventHistoryController.signal,
      historySize: workflow.historyEvents,
    });
  };

  const getOnlyWorkflowWithPendingActivities = async (
    refresh: number,
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if (refresh && $workflowRun?.workflow?.isRunning) {
      const { settings } = $page.data;

      const { workflow, error } = await fetchWorkflow({
        namespace,
        workflowId,
        runId,
      });

      if (error) {
        workflowError = error;
        return;
      }
      workflow.pendingActivities = await toDecodedPendingActivities(
        workflow,
        namespace,
        settings,
        $authUser?.accessToken,
      );
      $workflowRun = { ...$workflowRun, workflow };
    }
  };

  $: getWorkflowAndEventHistory(
    namespace,
    workflowId,
    runId,
    $eventFilterSort,
    $labsMode,
  );
  $: getOnlyWorkflowWithPendingActivities(
    $refresh,
    namespace,
    workflowId,
    runId,
  );

  onMount(() => {
    const sort = $page.url.searchParams.get('sort');
    if (sort) $eventFilterSort = sort as EventSortOrder;
  });

  onDestroy(() => {
    $timelineEvents = null;
    $workflowRun = initialWorkflowRun;
    $fullEventHistory = [];
    workflowError = undefined;

    if (eventHistoryController) {
      eventHistoryController.abort();
    }
  });
</script>

<LabsModeGuard>
  <div
    class="surface-primary absolute bottom-0 left-0 right-0 top-0 flex h-full flex-col gap-0"
  >
    {#if workflowError}
      <WorkflowError error={workflowError} />
    {:else if !$workflowRun.workflow}
      <Loading />
    {:else}
      <WorkflowHeaderV2 namespace={$page.params.namespace} />
      <slot />
    {/if}
  </div>
  <div class="flex h-full flex-col gap-0" slot="fallback">
    {#if workflowError}
      <WorkflowError error={workflowError} />
    {:else if !$workflowRun.workflow}
      <Loading />
    {:else}
      <WorkflowHeader namespace={$page.params.namespace} />
      <slot />
    {/if}
  </div>
</LabsModeGuard>
