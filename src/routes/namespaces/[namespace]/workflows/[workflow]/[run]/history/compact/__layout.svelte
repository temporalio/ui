<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff }) {
    const { events } = stuff as { events: HistoryEventWithId[] };
    const eventGroups = groupEvents(events);

    return {
      props: { eventGroups },
      stuff: { eventGroups },
    };
  };
</script>

<script lang="ts">
  import { groupEvents } from '$lib/models/group-events';
  import EventTable from '$lib/components/event-table.svelte';

  export let eventGroups: CompactEventGroups;
</script>

<EventTable events={eventGroups}>
  <div slot="details" class="w-full h-full py-4">
    <slot />
  </div>
</EventTable>
