<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url }) {
    const category = url.searchParams.get('category');

    const items = getEventsInCategory(stuff.events, category);
    const groups = stuff.eventGroups;

    return {
      props: {
        items,
        groups,
      },
    };
  };
</script>

<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';

  export let items: HistoryEventWithId[];
  export let groups: CompactEventGroups;
</script>

<EventSummary {items} {groups} expandAll />
