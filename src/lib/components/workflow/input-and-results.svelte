<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Loading from '$lib/holocene/loading.svelte';

  export let content: string;
  export let title: string;
</script>

<article class="flex w-full flex-col lg:w-1/2" {...$$restProps}>
  <h3 class="text-lg">{title}</h3>
  {#if content}
    <CodeBlock {content} class="mb-2 max-h-96" />
  {:else}
    <Loading title="In progress..." />
  {/if}
</article>
