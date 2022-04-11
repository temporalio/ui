<script lang="ts">
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsRow from './event-details-row.svelte';

  export let event: HistoryEventWithId | null = null;
  export let eventGroup: CompactEventGroup | null = null;

  let { key, value } = getSingleAttributeForEvent({ event, eventGroup });
</script>

<EventDetailsRow {key} {value} />
