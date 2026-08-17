<script lang="ts">
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { IconCode, IconCompact, IconFeed } from '$lib/io/icon';
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
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  let {
    history,
    groups,
    minimized = true,
  }: {
    history: IterableEventWithPending[];
    groups: EventGroups;
    minimized?: boolean;
  } = $props();

  const workflow = $derived($workflowRun.workflow);
  const reverseSort = $derived($eventFilterSort === 'descending');
  const updating = $derived(!$fullEventHistory.length);
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
        }
      : {
          compact: false as const,
          items: reverseSort
            ? [...pendingNexusOperations, ...pendingActivities, ...history]
            : [...history, ...pendingActivities, ...pendingNexusOperations],
          groups,
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
  <div class="border-t border-subtle px-4">
    <WorkflowHistoryJson />
  </div>
{:else}
  <div data-testid="event-summary-table">
    <EventSummaryTable {updating} {minimized} {...tableProps} />
  </div>
{/if}
