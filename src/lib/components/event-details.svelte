<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';
  import CodeBlock from './code-block.svelte';

  export let attributes: EventAttribute | Record<string, unknown>;
</script>

<section class="w-full px-8">
  {#each Object.entries(attributes) as [key, value]}
    <article
      class="w-full flex items-center content-start py-4 border-t-2 border-gray-300"
    >
      <h4 class="w-96 flex-grow">{format(key)}</h4>
      <div class="flex-grow w-full overflow-scroll">
        {#if value === null}
          <p class="font-mono whitespace-nowrap flex-grow">
            {value}
          </p>
        {:else if typeof value === 'object'}
          <div class="overflow-scroll flex-grow">
            <CodeBlock content={value} inline={true} />
          </div>
        {:else if value}
          <p class="whitespace-nowrap">{value}</p>
        {/if}
      </div>
    </article>
  {/each}
</section>
