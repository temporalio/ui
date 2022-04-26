<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url }) {
    const category = url.searchParams.get('category');

    const events = getEventsInCategory(stuff.events, category);

    let items: WorkflowEvent[] = events;
    const groups = stuff.eventGroups;

    return {
      props: {
        items,
        groups,
      },
      stuff: {
        matchingEvents: events,
      },
    };
  };
</script>

<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';

  export let items: WorkflowEvent[];
  export let groups: EventGroups;
</script>

<EventSummary {items} {groups} />
