<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { loading } from '$lib/stores/workflow-run-loading';
  import { timelineEvents } from '$lib/stores/events';

  import Header from '$lib/layouts/workflow-header.svelte';
  import Loading from '$holocene/loading.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { type EventSortOrder, eventFilterSort } from '$lib/stores/event-view';

  export let cancelEnabled: boolean = false;
  export let signalEnabled: boolean = false;

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
      {cancelEnabled}
      {signalEnabled}
    />
    <slot />
  {/if}
</main>
