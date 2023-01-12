<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun, refresh } from '$lib/stores/workflow-run';
  import { loading } from '$lib/stores/workflow-run-loading';
  import { timelineEvents } from '$lib/stores/events';

  import Header from '$lib/layouts/workflow-header.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { type EventSortOrder, eventFilterSort } from '$lib/stores/event-view';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { getPollers } from '$lib/services/pollers-service';
  import { toDecodedPendingActivities } from '$lib/models/pending-activities';

  export let terminateEnabled: boolean = false;
  export let cancelEnabled: boolean = false;
  export let signalEnabled: boolean = false;

  $: namespace = $page.params.namespace;
  $: workflowId = $page.params.workflow;
  $: runId = $page.params.run;

  const getWorkflow = async (
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
    $loading = false;
  };

  $: $refresh, getWorkflow(namespace, workflowId, runId);

  onMount(() => {
    const sort = $page.url.searchParams.get('sort');
    if (sort) $eventFilterSort = sort as EventSortOrder;
  });

  onDestroy(() => {
    $timelineEvents = null;
  });
</script>

<main class="flex h-full flex-col gap-6">
  {#if $loading}
    <Loading />
  {:else}
    <Header
      namespace={$page.params.namespace}
      workflow={$workflowRun.workflow}
      workers={$workflowRun.workers}
      {terminateEnabled}
      {cancelEnabled}
      {signalEnabled}
    />
    <slot />
  {/if}
</main>
