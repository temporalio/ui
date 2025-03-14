<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    EventTypeCategory,
    IterableEventWithPending,
  } from '$lib/types/events';

  export let history: IterableEventWithPending[];
  export let groups: EventGroups;
  export let minimized = true;

  $: ({ workflow } = $workflowRun);
  $: reverseSort = $eventFilterSort === 'descending';
  $: updating = !$fullEventHistory.length;
  $: compact = $eventViewType === 'compact';

  $: $eventCategoryFilter = $page.url?.searchParams?.get('category')
    ? ($page.url?.searchParams
        ?.get('category')
        .split(',') as EventTypeCategory[])
    : undefined;

  $: pendingActivities = workflow.pendingActivities;
  $: pendingNexusOperations = workflow.pendingNexusOperations;

  $: items = compact
    ? groups
    : reverseSort
    ? [...pendingNexusOperations, ...pendingActivities, ...history]
    : [...history, ...pendingActivities, ...pendingNexusOperations];

  const onAllClick = () => {
    $eventViewType = 'feed';
  };

  const onCompactClick = () => {
    $eventViewType = 'compact';
  };

  const onJSONClick = () => {
    $eventViewType = 'json';
  };
</script>

<div
  class="flex flex-col items-center justify-end gap-4 py-4 lg:flex-row lg:py-8"
>
  <div class="flex items-center gap-2 px-4">
    <ToggleButtons>
      <ToggleButton
        active={$eventViewType === 'feed'}
        data-testid="feed"
        icon="feed"
        class="h-10"
        on:click={onAllClick}>All</ToggleButton
      >
      <ToggleButton
        active={$eventViewType === 'compact'}
        data-testid="compact"
        icon="compact"
        on:click={onCompactClick}>Compact</ToggleButton
      >
      <ToggleButton
        active={$eventViewType === 'json'}
        data-testid="json"
        icon="json"
        on:click={onJSONClick}>JSON</ToggleButton
      >
    </ToggleButtons>
  </div>
</div>
{#if $eventViewType === 'json'}
  <div class="px-4">
    <WorkflowHistoryJson />
  </div>
{:else}
  <div data-testid="event-summary-table">
    <EventSummaryTable {updating} {items} {groups} {compact} {minimized} />
  </div>
{/if}
