<script context="module" lang="ts">
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow, run: runId, namespace } = page.params;
    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    const path =
      getWorkflowExecutionUrl(namespace, { id: workflow, runId }) +
      '/history/full';

    return {
      props: {
        events,
        path,
      },
    };
  }
</script>

<script lang="ts">
  import Event from '$lib/components/event.svelte';

  export let events: HistoryEventWithId[];
  export let path: string;
</script>

<section
  class="flex flex-col border-2 border-gray-300 w-full h-full rounded-lg mb-8"
>
  <div class="flex h-full">
    <div class="flex flex-col w-1/4 border-r-2 border-gray-300">
      <header
        class="bg-gray-100 text-gray-800 font-semibold p-4 rounded-tl-lg border-b-2"
      >
        Summary
      </header>
      <div class="w-full overflow-y-scroll">
        {#each events as event (event.id)}
          <Event {event} href="{path}/{event.id}" />
        {/each}
      </div>
    </div>
    <div class="flex flex-col w-3/4 rounded-tr-lg border-b-2">
      <header class="bg-gray-100 text-gray-800 font-semibold p-4">
        Details
      </header>
      <div class="h-full"><slot /></div>
    </div>
  </div>
</section>
