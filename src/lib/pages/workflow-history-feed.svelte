<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { events, eventGroups } from '$lib/stores/events';
</script>

<EventSummary items={$events} groups={$eventGroups} />
