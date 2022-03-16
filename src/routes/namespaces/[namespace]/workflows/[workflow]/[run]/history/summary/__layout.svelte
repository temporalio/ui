<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff, url }) {
    const { events } = stuff;

    const category = url.searchParams.get('category');

    return {
      props: {
        events,
        category,
      },
    };
  };
</script>

<script lang="ts">
  import EventTable from '../_event-table.svelte';

  export let events: HistoryEventWithId[];
  export let category: EventTypeCategory = null;

  $: visibleEvents = events.filter(
    (event) => !category || event.category === category,
  );
</script>

<EventTable {category} events={visibleEvents}>
  <slot />
</EventTable>
