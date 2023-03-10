<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EventDateFilter from '../event/event-date-filter.svelte';

  export let onDebugClick: () => void;
</script>

<section>
  <Accordion title="Options" icon="settings" readOnly stackSummary>
    <div slot="summary" class="flex flex-row items-center gap-4">
      <EventDateFilter compact={false} hideSort />
      <Button variant="destructive" on:click={onDebugClick}>Debug</Button>
    </div>
  </Accordion>
</section>
