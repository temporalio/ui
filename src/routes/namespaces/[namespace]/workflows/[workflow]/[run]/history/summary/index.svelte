<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url }) {
    const category = url.searchParams.get('category');

    const events = getEventsInCategory(stuff.events, category);

    let items: HistoryEventWithId[] = events;

    return {
      props: {
        items,
      },
      stuff: {
        matchingEvents: events,
      },
    };
  };
</script>

<script lang="ts">
  import EventSummary from '$lib/components/event/view/event-summary.svelte';

  export let items: HistoryEventWithId[];
</script>

<EventSummary {items} />
