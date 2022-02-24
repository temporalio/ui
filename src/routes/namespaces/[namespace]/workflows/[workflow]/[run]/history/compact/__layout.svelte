<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';

  export const load = async ({ stuff }: LoadInput) => {
    const { events } = stuff as { events: HistoryEventWithId[] };
    const eventGroups = groupEvents(events);

    return {
      props: { eventGroups },
    };
  };
</script>

<script lang="ts">
  import { groupEvents } from '$lib/models/group-events';
  import EventTable from '$lib/components/event-table.svelte';
  import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';

  export let eventGroups: CompactEventGroups;
</script>

<EventTable events={eventGroups}>
  <div slot="details" class="w-full h-full py-4">
    <slot />
  </div>
</EventTable>
