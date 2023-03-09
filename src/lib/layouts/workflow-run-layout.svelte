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
  import { authUser } from '$lib/stores/auth-user';

  import Header from '$lib/layouts/workflow-header.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { type EventSortOrder, eventFilterSort } from '$lib/stores/event-view';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { getPollers } from '$lib/services/pollers-service';
  import { toDecodedPendingActivities } from '$lib/models/pending-activities';
  import { fetchStartAndEndEvents } from '$lib/services/events-service';
  import WorkflowHistoryLayoutV2 from '$lib/components/eventV2/workflow-history-layout-v2.svelte';
  import WorkflowHeaderV2 from '$lib/components/eventV2/workflow-header-v2.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { featureFlags } from '$lib/stores/feature-flags';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

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
    workflow.pendingActivities = await toDecodedPendingActivities(
      workflow,
      namespace,
      settings,
      $authUser?.accessToken,
    );
    $workflowRun = { workflow, workers };
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
  {:else if $featureFlags.eventHistoryV2}
    <WorkflowHeaderV2 namespace={$page.params.namespace}>
      <label
        slot="feature-flag"
        for="new-ui"
        class="mt-2 flex items-center gap-4 font-secondary text-sm"
        >v2 UI
        <ToggleSwitch
          id="new-ui"
          checked={$featureFlags.eventHistoryV2}
          on:change={() =>
            ($featureFlags.eventHistoryV2 = !$featureFlags.eventHistoryV2)}
        />
      </label>
    </WorkflowHeaderV2>
    <WorkflowHistoryLayoutV2 />
  {:else}
    <Header namespace={$page.params.namespace}>
      <label
        slot="feature-flag"
        for="new-ui"
        class="mt-2 flex items-center gap-4 font-secondary text-sm"
        >v2 UI
        <ToggleSwitch
          id="new-ui"
          checked={$featureFlags.eventHistoryV2}
          on:change={() =>
            ($featureFlags.eventHistoryV2 = !$featureFlags.eventHistoryV2)}
        />
      </label>
    </Header>
    <slot />
  {/if}
</div>
