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
  import Event from './_event.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import { createEventStore } from '$lib/stores/events';

  export let namespace: string;
  export let executionId: string;
  export let runId: string;

  const { filtered, format } = createEventStore(namespace, executionId, runId);
</script>

<section>
  {#if $format === 'grid'}
    <table class="border-collapse w-full border-2 table-fixed">
      <thead>
        <tr>
          <th class="w-1/12">ID</th>
          <th class="w-2/12">Type</th>
          <th class="w-2/12">Time</th>
          <th class="w-7/12">Details</th>
        </tr>
      </thead>
      <tbody>
        {#each $filtered as event, index}
          <Event {event} {index} />
        {/each}
      </tbody>
    </table>
  {/if}

  {#if $format === 'json'}
    {#each $filtered as event}
      <CodeBlock heading={`Event ID: ${event.eventId}`} content={event} />
    {/each}
  {/if}
</section>
