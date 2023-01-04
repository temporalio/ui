<script lang="ts">
  import { page } from '$app/stores';
  import { timelineEvents } from '$lib/stores/events';

  import Header from '$lib/layouts/workflow-header.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { type EventSortOrder, eventFilterSort } from '$lib/stores/event-view';
  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;
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
  <Header
    namespace={$page.params.namespace}
    {workflow}
    {workers}
    {cancelEnabled}
    {signalEnabled}
  />
  <slot />
</main>
