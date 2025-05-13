<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
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

<div class="flex items-center justify-end gap-4 pt-4 lg:pt-8">
  <div class="flex items-center gap-2 px-4">
    <TabButtons>
      <TabButton
        active={$eventViewType === 'feed'}
        data-testid="feed"
        icon="feed"
        class="h-10"
        on:click={onAllClick}>All</TabButton
      >
      <TabButton
        active={$eventViewType === 'compact'}
        data-testid="compact"
        icon="compact"
        class="h-10"
        on:click={onCompactClick}>Compact</TabButton
      >
      <TabButton
        active={$eventViewType === 'json'}
        data-testid="json"
        icon="json"
        class="h-10"
        on:click={onJSONClick}>JSON</TabButton
      >
    </TabButtons>
  </div>
</div>
{#if $eventViewType === 'json'}
  <div class="border-t border-subtle px-4">
    <WorkflowHistoryJson />
  </div>
{:else}
  <div data-testid="event-summary-table">
    <EventSummaryTable {updating} {items} {groups} {compact} {minimized} />
  </div>
{/if}
