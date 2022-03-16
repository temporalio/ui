<script lang="ts" context="module">
  export { loadEventDetails as load } from '../_load-event-details';
</script>

<script lang="ts">
  import EventDetails from '../_event-details.svelte';

  export let event: HistoryEventWithId;
  export let eventGroup: CompactEventGroup;
</script>

<EventDetails {event} {eventGroup} />
