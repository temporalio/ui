<script lang="ts">
  import { getContext } from 'svelte';
  import { EventGroups } from '$lib/models/events-group';
  import EventTable from '$lib/components/event-table.svelte';

  export let events = getContext<EventualHistoryEvents>('events');
</script>

{#await EventGroups.fromPromise(events) then activities}
  <EventTable events={activities}>
    <div slot="details" class="w-full h-full py-4">
      <slot />
    </div>
  </EventTable>
{/await}
