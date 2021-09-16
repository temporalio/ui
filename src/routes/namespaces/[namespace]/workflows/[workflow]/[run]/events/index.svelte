<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ context, page }: LoadInput) {
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
  import Events from './_events.svelte';
  import EventsFilters from './_events-filters.svelte';
  export let eventType;
  export let namespace: string;
  export let executionId: string;
  export let runId: string;

  let eventFormat: EventFormat = 'grid';
</script>

<div class="px-6 py-6">
  <!-- <EventsFilters bind:eventFormat bind:eventType {history} {execution} /> -->
  <Events {namespace} {executionId} {runId} {eventFormat} {eventType} />
</div>
