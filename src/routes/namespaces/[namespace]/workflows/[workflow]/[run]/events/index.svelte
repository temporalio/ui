<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;

    return {
      props: {
        executionId,
        runId,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import { createEventStore } from '$lib/stores/events';

  import Events from './_events.svelte';
  import EventsFilters from './_events-filters.svelte';

  export let namespace: string;
  export let executionId: string;
  export let runId: string;

  const { all, filtered, type, format, activities } = createEventStore(
    namespace,
    executionId,
    runId,
  );
</script>

<div class="px-6 py-6">
  <EventsFilters
    events={$all}
    eventType={type}
    eventFormat={format}
    execution={executionId}
  />
  <Events events={$filtered} eventFormat={$format} />
</div>
