<script lang="ts">
  import Event from './_event.svelte';
  import type { History } from '$types/temporal/api/history/v1/message';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let history: History;
  export let eventFormat;
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
    <CodeBlock heading="" content={JSON.stringify(history.events)} />
  {/if}
</section>

<style lang="postcss">
  .hljs {
    height: 30em;
    overflow-y: scroll;
  }
</style>
