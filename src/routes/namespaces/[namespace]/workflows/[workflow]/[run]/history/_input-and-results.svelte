<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';

  import CodeBlock from '$lib/components/code-block.svelte';

  export let title: string;
  export let content: string;
  export let isRunning = false;
</script>

<article
  class="flex flex-col border-2 border-gray-300 p-4 rounded-lg w-full lg:w-1/2"
  data-cy={$$props.dataCy}
>
  <h3 class="text-lg">{title}</h3>
  {#if isRunning}
    <div class="my-12 flex flex-col justify-start items-center gap-2">
      <div
        class="flex rounded-full items-center justify-center w-16 h-16 bg-gray-200"
      >
        <Icon
          icon={faSpinner}
          scale={1.2}
          class="block w-full h-full animate-spin"
        />
      </div>
      <h2 class="text-xl font-medium">In progress…</h2>
    </div>
  {:else}
    <CodeBlock {content} class="mb-2 max-h-96" />
  {/if}
</article>
