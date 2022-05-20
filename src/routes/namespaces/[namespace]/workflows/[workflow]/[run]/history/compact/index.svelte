<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { ascendingEventGroups } from '$lib/stores/events';
</script>

<EventSummary
  items={$ascendingEventGroups}
  groups={$ascendingEventGroups}
  compact={true}
/>
