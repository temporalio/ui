<script lang="ts">
  import { page } from '$app/stores';

  import { importEventGroups } from '$lib/stores/import-events';
  import EventSummary from '$lib/components/event/event-summary.svelte';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: filteredEventGroups = $importEventGroups.filter((event: EventGroups) => {
    if (category) return event.category === category;
    return event;
  });
</script>

<EventSummary
  items={filteredEventGroups}
  groups={$importEventGroups}
  compact={true}
/>
