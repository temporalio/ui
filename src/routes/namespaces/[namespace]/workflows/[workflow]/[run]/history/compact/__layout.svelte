<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff }: LoadInput) {
    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    return {
      props: {
        events,
      },
    };
  }
</script>

<script lang="ts">
  import { Activities } from '$lib/models/activity';
  import EventTable from '$lib/components/event-table.svelte';

  export let events: HistoryEventWithId[];

  let activities = new Activities(events);
</script>

<EventTable events={activities}>
  <div slot="details" class="w-full h-full py-4">
    <slot />
  </div>
</EventTable>
