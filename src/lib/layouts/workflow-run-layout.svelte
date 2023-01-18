<script lang="ts">
  import { page } from '$app/stores';
  import {
    initialWorkflowRun,
    refresh,
    workflowRun,
  } from '$lib/stores/workflow-run';
  import {
    timelineEvents,
    eventHistory,
    initialEventHistory,
  } from '$lib/stores/events';

  import Header from '$lib/layouts/workflow-header.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { type EventSortOrder, eventFilterSort } from '$lib/stores/event-view';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { getPollers } from '$lib/services/pollers-service';
  import { toDecodedPendingActivities } from '$lib/models/pending-activities';
  import { fetchStartAndEndEvents } from '$lib/services/events-service';

  export let terminateEnabled: boolean = false;
  export let cancelEnabled: boolean = false;
  export let signalEnabled: boolean = false;
  export let resetEnabled: boolean = false;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  const getWorkflowAndEventHistory = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    const { settings, user } = $page.data;

    const workflow = await fetchWorkflow({
      namespace,
      workflowId,
      runId,
    });
    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue, namespace });
    workflow.pendingActivities = await toDecodedPendingActivities(
      workflow,
      namespace,
      settings,
      user?.accessToken,
    );
    $workflowRun = { workflow, workers };
    const events = await fetchStartAndEndEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: user?.accessToken,
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

<main class="flex h-full flex-col gap-6">
  {#if !$workflowRun.workflow}
    <Loading />
  {:else}
    <Header
      namespace={$page.params.namespace}
      {terminateEnabled}
      {cancelEnabled}
      {signalEnabled}
      {resetEnabled}
    />
    <slot />
  {/if}
</main>
