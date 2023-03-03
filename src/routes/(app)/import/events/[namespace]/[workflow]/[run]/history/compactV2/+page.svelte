<script lang="ts">
  import { page } from '$app/stores';

  import { importEventGroups, importEvents } from '$lib/stores/import-events';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import EventGroupSummaryCard from '$lib/components/eventV2/event-group-summary-card.svelte';

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
  $: finalItem =
    $eventFilterSort === 'descending'
      ? $importEvents?.[0]
      : $importEvents?.[$importEvents?.length - 1];
</script>

<div class="flex gap-4">
  <div class="flex flex-col gap-4 w-full">
    {#if initialItem}
      <EventGroupSummaryCard
        event={initialItem}
        visibleItems={filteredEventGroups}
        {initialItem}>{initialItem.name}</EventGroupSummaryCard
      >
    {/if}
    {#each filteredEventGroups as item}
      <EventGroupSummaryCard
        hasSubGroup={Boolean(item.subGroups.length)}
        event={item}
        visibleItems={filteredEventGroups}
        {initialItem}>{item.name}</EventGroupSummaryCard
      >
      {#if item.subGroups.length}
        <div class="ml-8 flex flex-col gap-2 w-full">
          {#each item.subGroups as group}
            <EventGroupSummaryCard
              isSubGroup
              event={group}
              visibleItems={filteredEventGroups}
              {initialItem}>{group.name}</EventGroupSummaryCard
            >
          {/each}
        </div>
      {/if}
    {/each}
    {#if finalItem}
      <EventGroupSummaryCard
        event={finalItem}
        visibleItems={filteredEventGroups}
        {initialItem}
      />
    {/if}
  </div>
</div>
