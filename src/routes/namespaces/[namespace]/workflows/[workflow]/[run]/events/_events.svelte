<script lang="ts">
  import Event from './_event.svelte';
  import type { History } from '$types';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let history: History;
  export let eventFormat: EventFormat;
</script>

<section>
  {#if eventFormat === 'grid'}
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
        {#each history.events as event, index}
          <Event {event} {index} />
        {/each}
      </tbody>
    </table>
  {/if}

  {#if eventFormat === 'json'}
    {#each history.events as event}
      <CodeBlock
        heading={`Event ID: ${event.eventId}`}
        content={JSON.stringify(event)}
      />
    {/each}
  {/if}
</section>
