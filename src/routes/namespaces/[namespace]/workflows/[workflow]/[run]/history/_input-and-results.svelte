<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';

  export let title: string;
  export let content: string;
</script>

{#if content}
  <article
    class="flex flex-col border-2 border-gray-300 p-4 rounded-lg w-full lg:w-1/2"
  >
    <h3 class="text-lg">{title}</h3>
    <CodeBlock {content} class="mb-2" />
  </article>
{/if}
