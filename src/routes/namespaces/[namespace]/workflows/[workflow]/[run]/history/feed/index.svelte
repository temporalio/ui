<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { getContext } from 'svelte';

  const { events, eventGroups } = getContext('eventHistory');
</script>

<EventSummary items={events} groups={eventGroups} />
