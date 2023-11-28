<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import NorthStarLayout from '$lib/components/north-star/north-star-layout.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
</script>

<LabsModeGuard>
  <NorthStarLayout />
  <svelte:fragment slot="fallback">
    <EventSummary compact={true} />
  </svelte:fragment>
</LabsModeGuard>
