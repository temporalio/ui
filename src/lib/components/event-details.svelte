<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from './code-block.svelte';

  export let attributes:
    | EventAttribute
    | PendingActivity
    | Record<string, unknown>;
</script>

{#each Object.entries(attributes) as [key, value]}
  <article
    class="flex items-center content-start w-full py-4 border-t-2 first:border-t-0 border-gray-300"
  >
    <h4 class="w-96 flex-grow">{format(key)}</h4>
    <div class="flex-grow w-full">
      {#if value === null}
        <p class="font-mono whitespace-nowrap flex-grow">
          {value}
        </p>
      {:else if typeof value === 'object'}
        <CodeBlock content={value} />
      {:else if value}
        <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
      {/if}
    </div>
  </article>
{/each}
