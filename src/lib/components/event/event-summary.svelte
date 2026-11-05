<script lang="ts">
  import { page } from '$app/state';

  import ActivityCommands from '$lib/components/activity/activity-commands.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { IconCode, IconCompact, IconFeed } from '$lib/io/icon';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { materializeGroup } from '$lib/services/grouped-event-buffer';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { eventCategoryFilter, eventTypeFilter } from '$lib/stores/filters';
  import { triggerRefresh, workflowRun } from '$lib/stores/workflow-run';
  import type {
    EventTypeCategory,
    IterableEventWithPending,
    WorkflowEvent,
  } from '$lib/types/events';
  import type { WorkflowExecutionIdentity } from '$lib/types/workflows';
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  let {
    history,
    initialEvent,
    workflowTaskGroups = [],
    groups,
    workflowExecutionIdentity,
    minimized = true,
    loading = false,
    updating = false,
  }: {
    history: IterableEventWithPending[];
    initialEvent: WorkflowEvent | undefined;
    workflowTaskGroups?: EventGroups;
    groups: EventGroups;
    workflowExecutionIdentity: WorkflowExecutionIdentity;
    minimized?: boolean;
    loading?: boolean;
    updating?: boolean;
  } = $props();

  const workflow = $derived($workflowRun.workflow);
  const reverseSort = $derived($eventFilterSort === 'descending');
  const filteredEvents = $derived(
    history
      .filter(isEvent)
      .filter((event) => $eventTypeFilter.includes(event.category)),
  );
  const compact = $derived($eventViewType === 'compact');

  $effect(() => {
    const category = page.url?.searchParams?.get('category');
    $eventCategoryFilter = category
      ? (category.split(',') as EventTypeCategory[])
      : undefined;
  });

  const pendingActivities = $derived(workflow?.pendingActivities ?? []);
  const pendingNexusOperations = $derived(
    workflow?.pendingNexusOperations ?? [],
  );

  // Union on `compact` — the pair travels as one object.
  const tableProps = $derived(
    compact
      ? {
          compact: true as const,
          items: orderGroupsByPending(groups, reverseSort),
          materializeGroup,
        }
      : {
          compact: false as const,
          items: reverseSort
            ? [...pendingNexusOperations, ...pendingActivities, ...history]
            : [...history, ...pendingActivities, ...pendingNexusOperations],
          groups,
          workflowTaskGroups,
        },
  );

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
        Icon={IconFeed}
        class="h-10"
        onclick={onAllClick}>All</TabButton
      >
      <TabButton
        active={$eventViewType === 'compact'}
        data-testid="compact"
        Icon={IconCompact}
        class="h-10"
        onclick={onCompactClick}>Compact</TabButton
      >
      <TabButton
        active={$eventViewType === 'json'}
        data-testid="json"
        Icon={IconCode}
        class="h-10"
        onclick={onJSONClick}>JSON</TabButton
      >
    </TabButtons>
  </div>
</div>
{#if $eventViewType === 'json'}
  <div class="border-t border-primary px-4">
    <WorkflowHistoryJson events={filteredEvents} />
  </div>
{:else}
  <div data-testid="event-summary-table">
    <EventSummaryTable
      {workflowExecutionIdentity}
      {initialEvent}
      {loading}
      {updating}
      {minimized}
      {...tableProps}
    >
      {#snippet activityActions(activity)}
        {#if workflow}
          <ActivityCommands
            {activity}
            {workflowExecutionIdentity}
            {workflow}
            onRefresh={triggerRefresh}
            class="justify-end"
          />
        {/if}
      {/snippet}
    </EventSummaryTable>
  </div>
{/if}
