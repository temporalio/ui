<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { ascendingEventGroups, loading } from '$lib/stores/events';
</script>

<EventSummary
  items={$ascendingEventGroups}
  groups={$ascendingEventGroups}
  compact={true}
  loading={$loading}
/>
