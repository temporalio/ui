<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';
  import CodeBlock from './code-block.svelte';

  export let attributes: EventAttribute | Record<string, unknown>;

  console.log(attributes);
</script>

<section class="w-full px-8">
  {#each Object.entries(attributes) as [key, value]}
    <article class="w-full flex items-start py-4 border-t-2 border-gray-300">
      <h4 class="w-1/3">{format(key)}</h4>
      <div class="flex gap-2 w-full">
        {#if value === null}
          <CodeBlock content={value} inline={true} />
        {:else if typeof value === 'object'}
          <CodeBlock content={value} inline={true} />
        {:else if value}
          <p class="w-full label">{value}</p>
        {/if}
      </div>
    </article>
  {/each}
</section>
