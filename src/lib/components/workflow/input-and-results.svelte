<script lang="ts">
  import { capitalize } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Loading from '$lib/holocene/loading.svelte';

  export let type: 'input' | 'results';
  export let content: string;

  $: title = capitalize(type);
</script>

<article class="flex w-full flex-col lg:w-1/2" data-cy="workflow-{type}">
  <h3 class="text-lg">{title}</h3>
  {#if content}
    <CodeBlock {content} class="mb-2 max-h-96" />
  {:else}
    <Loading title="In progress..." />
  {/if}
</article>
