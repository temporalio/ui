<script lang="ts">
  import { page } from '$app/stores';

  import { importEvents, importEventGroups } from '$lib/stores/import-events';
  import EventSummary from '$lib/components/event/event-summary.svelte';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: filteredEvents = $importEvents.filter((event: WorkflowEvent) => {
    if (category) return event.category === category;
    return event;
  });
</script>

<EventSummary items={filteredEvents} groups={$importEventGroups} />
