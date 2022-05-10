<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { getContext } from 'svelte';

  const { eventGroups } = getContext('eventHistory');
</script>

<EventSummary items={eventGroups} groups={eventGroups} compact={true} />
