<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { onDestroy } from 'svelte';

  onDestroy(() => {
    $timelineEvents = null;
  });
</script>

<EventSummary />
