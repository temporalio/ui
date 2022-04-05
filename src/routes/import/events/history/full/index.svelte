<script lang="ts">
  import { page } from '$app/stores';

  import { importEvents } from '$lib/stores/import-events';
  import FullEvent from '$lib/components/event/view/event-full.svelte';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: filteredEvents = $importEvents.filter((event) => {
    if (category) return event.category === category;
    return event;
  });
</script>

<FullEvent items={filteredEvents} />
