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

  import EventsFilters from './_events-filters.svelte';
  import Loading from '$lib/components/loading.svelte';

  export let namespace: string;
  export let executionId: string;
  export let runId: string;

  $: store = createEventStore(namespace, executionId, runId);
  $: all = store.all;
  $: type = store.type;
  $: format = store.format;
</script>

<div class="px-6 py-6">
  <EventsFilters
    events={$all}
    eventType={type}
    eventFormat={format}
    execution={executionId}
  />
  <Loading loading={$store.loading} updating={$store.updating} />
  <slot />
</div>
