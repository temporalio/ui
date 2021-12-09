<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from './code-block.svelte';

  export let attributes: Record<string, unknown>;
</script>

<div class="flex items-center event gap-4 w-full">
  {#each Object.entries(attributes) as [attribute, value]}
    {#if typeof value === 'object'}
      <div class="flex gap-2 flex-nowrap">
        <h4>{format(attribute)}</h4>
        <CodeBlock content={value} inline={true} />
      </div>
    {:else if value}
      <div class="flex gap-2 flex-nowrap">
        <h4>{format(attribute)}</h4>
        <p class="w-full label">{value}</p>
      </div>
    {/if}
  {/each}
</div>

<style lang="postcss">
  h4 {
    @apply whitespace-nowrap;
  }

  .label {
    @apply bg-gray-300 px-2 rounded-sm;
  }
</style>
