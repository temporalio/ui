<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from './code-block.svelte';

  export let attributes: Record<string, unknown>;
</script>

<div class="flex items-center event gap-4 w-full h-full overflow-x-hidden">
  {#each Object.entries(attributes).filter(([, value]) => !!value) as [attribute, value]}
    <div class="flex gap-2">
      <h4 class="flex items-center">{format(attribute)}</h4>
      {#if typeof value === 'object'}
        <CodeBlock content={value} inline={true} />
      {:else}
        <p class="w-full label">{value}</p>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  h4 {
    @apply whitespace-nowrap;
  }

  .label {
    @apply bg-gray-300 px-2 rounded-sm whitespace-nowrap;
  }
</style>
