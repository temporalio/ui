<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from './code-block.svelte';

  export let attributes:
    | EventAttribute
    | PendingActivity
    | Record<string, unknown>;
</script>

{#each Object.entries(attributes) as [key, value] (key)}
  {#if value !== null || value !== undefined}
    <article
      class="flex items-center content-start w-full border-b-2 last:border-b-0 border-gray-200 py-1"
    >
      <h4 class="w-96 flex-grow">{format(key)}</h4>
      <div class="flex-grow w-full">
        {#if typeof value === 'object'}
          <CodeBlock content={value} />
        {:else if value}
          <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
        {:else}
          <p class="text-gray-500">Undefined</p>
        {/if}
      </div>
    </article>
  {/if}
{/each}
