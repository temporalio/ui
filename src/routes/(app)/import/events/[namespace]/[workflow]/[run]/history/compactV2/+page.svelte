<script lang="ts">
  import { page } from '$app/stores';

  import { importEventGroups, importEvents } from '$lib/stores/import-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import EventGroupSummaryCard from '$lib/components/eventV2/event-group-summary-card.svelte';
  import InitialEventCard from '$lib/components/eventV2/initial-event-card.svelte';
  import LastEventCard from '$lib/components/eventV2/last-event-card.svelte';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: sortedEvents =
    $eventFilterSort === 'descending'
      ? [...$importEventGroups].reverse()
      : $importEventGroups;
  $: filteredEventGroups = sortedEvents.filter((event: EventGroup) => {
    if (category) return event.category === category;
    return event;
  });

  $: initialItem =
    $eventFilterSort === 'descending'
      ? $importEvents?.[$importEvents?.length - 1]
      : $importEvents?.[0];
  $: lastItem =
    $eventFilterSort === 'descending'
      ? $importEvents?.[0]
      : $importEvents?.[$importEvents?.length - 1];

  $: ({ input, results } = getWorkflowStartedCompletedAndTaskFailedEvents({
    start: $importEvents,
    end: $importEvents,
  }));
  $: stackTrace = results && getStackTrace(parseWithBigInt(results));
</script>

<div class="flex gap-4">
  <div class="flex w-full flex-col">
    {#if initialItem}
      <InitialEventCard
        event={initialItem}
        {input}
        visibleItems={filteredEventGroups}
        {initialItem}
      />
    {/if}
    {#each filteredEventGroups as item}
      <EventGroupSummaryCard
        event={item}
        visibleItems={filteredEventGroups}
        {initialItem}
      />
      {#if item.subGroups.length}
        <div class="pl-8 flex w-full flex-col">
          {#each item.subGroups as group}
            <EventGroupSummaryCard
              isSubGroup
              event={group}
              visibleItems={filteredEventGroups}
              {initialItem}
            />
          {/each}
        </div>
      {/if}
    {/each}
    {#if lastItem}
      <LastEventCard
        event={lastItem}
        {results}
        {stackTrace}
        visibleItems={filteredEventGroups}
        {initialItem}
      />
    {/if}
  </div>
</div>
