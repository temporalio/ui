<script lang="ts">
  import { page } from '$app/stores';

  import { importEvents } from '$lib/stores/import-events';
  import EventFullView from '$lib/components/event/view/event-summary.svelte';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: filteredEvents = $importEvents.filter((event) => {
    if (category) return event.category === category;
    return event;
  });
</script>

<EventFullView items={filteredEvents} expandAll />
