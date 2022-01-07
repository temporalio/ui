<script lang="ts">
  import { getContext } from 'svelte';
  import { Activities } from '$lib/models/activity';
  import EventTable from '$lib/components/event-table.svelte';

  export let events = getContext<EventualHistoryEvents>('events');
</script>

{#await Activities.fromPromise(events) then activities}
  <EventTable events={activities}>
    <div slot="details" class="w-full h-full py-4">
      <slot />
    </div>
  </EventTable>
{/await}
