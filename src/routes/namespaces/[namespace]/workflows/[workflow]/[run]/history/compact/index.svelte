<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { eventGroups } from '$lib/stores/events';
</script>

<EventSummary items={$eventGroups} groups={$eventGroups} compact={true} />
