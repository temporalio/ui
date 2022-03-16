<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff, url }) {
    const { eventGroups } = stuff;

    const category = url.searchParams.get('category');

    return {
      props: {
        eventGroups,
        category,
      },
    };
  };
</script>

<script lang="ts">
  import EventTable from '../_event-table.svelte';

  export let eventGroups: CompactEventGroups;
  export let category: EventTypeCategory = null;

  $: visibleEvents = eventGroups.filter(
    (event) => !category || event.category === category,
  );
</script>

<EventTable {category} events={visibleEvents}>
  <slot />
</EventTable>
