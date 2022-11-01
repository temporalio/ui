<script lang="ts">
  import { updating } from '$lib/stores/events';
  import { capitalize } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Loading from '$holocene/loading.svelte';

  export let type: 'input' | 'results';
  export let content: string;

  $: title = capitalize(type);
</script>

<article class="flex w-full flex-col lg:w-1/2" data-cy="workflow-{type}">
  <h3 class="text-lg">{title}</h3>
  {#if content}
    {#if $updating}
      <Loading title="In progress..." />
    {:else}
      <CodeBlock {content} class="mb-2 max-h-96" />
    {/if}
  {:else}
    <Loading title="In progress..." />
  {/if}
</article>
