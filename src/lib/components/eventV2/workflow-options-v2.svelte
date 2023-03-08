<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import EventDateFilter from '../event/event-date-filter.svelte';
</script>

<section>
  <Accordion title="Options" icon="settings" readOnly>
    <div slot="summary" class="flex flex-col gap-4">
      <EventDateFilter compact={false} hideSort />
    </div>
  </Accordion>
</section>
