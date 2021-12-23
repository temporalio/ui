<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';
  import CodeBlock from './code-block.svelte';

  export let attributes: EventAttribute | Record<string, unknown>;
</script>

<section class="px-4">
  {#each Object.entries(attributes) as [key, value]}
    <article
      class="w-full flex items-center content-start py-4 border-t-2 border-gray-300 first:border-t-0 "
    >
      <h4 class="w-96 flex-grow">{format(key)}</h4>
      <div class="flex-grow w-full">
        {#if value === null}
          <p class="font-mono whitespace-nowrap flex-grow">
            {value}
          </p>
        {:else if typeof value === 'object'}
          <div class="flex-grow">
            <CodeBlock content={value} inline={true} />
          </div>
        {:else if value}
          <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
        {/if}
      </div>
    </article>
  {/each}
</section>
