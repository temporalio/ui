<script lang="ts">
  import { EventGroups } from '$lib/models/events-group';
  import EventTable from '$lib/components/event-table.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  export let events = getAppContext('events');
</script>

{#await EventGroups.fromPromise(events) then activities}
  <EventTable events={activities}>
    <div slot="details" class="w-full h-full py-4">
      <slot />
    </div>
  </EventTable>
{/await}
