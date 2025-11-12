<script lang="ts">
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
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

  $: ({ workflow } = $workflowRun);
  $: reverseSort = $eventFilterSort === 'descending';
  $: updating = !$fullEventHistory.length;
  $: compact = $eventViewType === 'compact';

  $: $eventCategoryFilter = page.url?.searchParams?.get('category')
    ? (page.url?.searchParams
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
</script>

{#if $eventViewType === 'json'}
  <WorkflowHistoryJson />
{:else}
  <div data-testid="event-summary-table">
    <EventSummaryTable {updating} {items} {groups} {compact} />
  </div>
{/if}
