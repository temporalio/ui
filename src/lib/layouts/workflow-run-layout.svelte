<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/stores';

  import Loading from '$lib/holocene/loading.svelte';
  import Header from '$lib/layouts/workflow-header.svelte';
  import { toDecodedPendingActivities } from '$lib/models/pending-activities';
  import { fetchStartAndEndEvents } from '$lib/services/events-service';
  import {
    getPollers,
    type GetPollersResponse,
    getTaskQueueCompatibility,
    getWorkerTaskReachability,
  } from '$lib/services/pollers-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { authUser } from '$lib/stores/auth-user';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import {
    eventHistory,
    initialEventHistory,
    timelineEvents,
  } from '$lib/stores/events';
  import {
    initialWorkflowRun,
    refresh,
    workflowRun,
  } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    getUniqueBuildIdsFromPollers,
    pollerHasVersioning,
  } from '$lib/utilities/task-queue-compatibility';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

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

  const getReachability = async ({
    namespace,
    workers,
    taskQueue,
  }: {
    namespace: string;
    workers: GetPollersResponse;
    taskQueue: string;
  }) => {
    const pollerUsesVersioning = pollerHasVersioning(workers.pollers);
    if (!pollerUsesVersioning) return;
    const buildIds = getUniqueBuildIdsFromPollers(workers.pollers);
    return await getWorkerTaskReachability({
      namespace,
      buildIds,
      taskQueue,
    });
  };

  const getWorkflowAndEventHistory = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    const { settings } = $page.data;

    const workflow = await fetchWorkflow({
      namespace,
      workflowId,
      runId,
    });
    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue, namespace });
    const compatibility = await getCompatibility(workflow, taskQueue);
    const reachability = await getReachability({
      namespace,
      workers,
      taskQueue,
    });
    workflow.pendingActivities = await toDecodedPendingActivities(
      workflow,
      namespace,
      settings,
      $authUser?.accessToken,
    );
    $workflowRun = { workflow, workers, compatibility, reachability };
    const events = await fetchStartAndEndEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: $authUser?.accessToken,
    });
    $eventHistory = events;
  };

  $: $refresh, getWorkflowAndEventHistory(namespace, workflowId, runId);

  onMount(() => {
    const sort = $page.url.searchParams.get('sort');
    if (sort) $eventFilterSort = sort as EventSortOrder;
  });

  onDestroy(() => {
    $timelineEvents = null;
    $workflowRun = initialWorkflowRun;
    $eventHistory = initialEventHistory;
  });
</script>

<div class="flex h-full flex-col gap-6">
  {#if !$workflowRun.workflow}
    <Loading />
  {:else}
    <Header namespace={$page.params.namespace} />
    <slot />
  {/if}
</div>
