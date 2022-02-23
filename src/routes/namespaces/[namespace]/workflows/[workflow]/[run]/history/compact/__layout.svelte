<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';

  export const load = async ({ stuff }: LoadInput) => {
    const { events } = stuff;

    console.log({ events });

    return {
      props: { events },
    };
  };
</script>

<script lang="ts">
  import { EventGroups } from '$lib/models/events-group';
  import EventTable from '$lib/components/event-table.svelte';

  export let events: HistoryEventWithId[];

  const activities = EventGroups.from(events);
</script>

<EventTable events={activities}>
  <div slot="details" class="w-full h-full py-4">
    <slot />
  </div>
</EventTable>
