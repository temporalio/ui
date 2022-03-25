<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url, params }) {
    const category = url.searchParams.get('category');
    const validViews = ['summary', 'compact', 'json'];

    const events = getEventsInCategory(stuff.events, category);
    const eventGroups = getEventsInCategory(stuff.eventGroups, category);

    let items: HistoryEventWithId[] | CompactEventGroups;

    if (params.view === 'summary') items = events;
    if (params.view === 'compact') items = eventGroups;

    if (!validViews.includes(params.view)) return { status: 404 };

    return {
      props: {
        items,
        category,
      },
      stuff: {
        matchingEvents: events,
        matchingEventGroups: eventGroups,
      },
    };
  };
</script>

<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';

  export let items: IterableEvents;
  export let category: EventTypeCategory;
</script>

<EventSummary {items} {category}><slot /></EventSummary>
