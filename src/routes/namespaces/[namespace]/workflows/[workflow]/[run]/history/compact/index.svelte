<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url }) {
    const category = url.searchParams.get('category');

    const eventGroups = getEventsInCategory(stuff.eventGroups, category);

    let items: CompactEventGroups = eventGroups;

    return {
      props: {
        items,
      },
      stuff: {
        matchingEventGroups: eventGroups,
      },
    };
  };
</script>

<script lang="ts">
  import CompactEvent from '$lib/components/event/view/event-compact.svelte';

  export let items: IterableEvents;
</script>

<CompactEvent {items} />
