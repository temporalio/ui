<script lang="ts" context="module">
  import { loadEventDetails } from '../_load-event-details';

  export const load = loadEventDetails;
</script>

<script lang="ts">
  import EventDetails from '../_event-details.svelte';

  export let event: HistoryEventWithId;
  export let eventGroup: CompactEventGroup;
</script>

<EventDetails {event} {eventGroup} />
