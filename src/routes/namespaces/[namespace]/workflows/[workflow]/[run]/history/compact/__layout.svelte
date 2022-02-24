<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';

  export const load = async ({ stuff }: LoadInput) => {
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
  import EventGroupTable from '$lib/components/event-group-table.svelte';

  export let eventGroups: CompactEventGroups;
</script>

<EventGroupTable events={eventGroups}>
  <div slot="details" class="w-full h-full py-4">
    <slot />
  </div>
</EventGroupTable>
