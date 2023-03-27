<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';

  export let content: string;
  export let title: string;
</script>

<article class="flex w-full flex-col lg:w-1/2" {...$$restProps}>
  <h3 class="text-lg">{title}</h3>
  {#if content}
    <CodeBlock {content} class="mb-2 lg:max-h-96" />
  {:else}
    <CodeBlock
      content="Results will appear upon completion."
      language="text"
      class="mb-2 lg:max-h-96"
      copyable={false}
    />
  {/if}
</article>
