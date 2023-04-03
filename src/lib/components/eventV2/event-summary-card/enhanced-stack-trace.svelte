<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/components/copyable.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let column: number;
  export let filePath: string;
  export let functionName: string;
  export let line: number;
  export let snippet: string;
  export let source: string;
  export let showSnippet = true;

  let codeBlock: HTMLDivElement;

  $: lineStart = showSnippet ? line - 4 : 1;

  const toggleShowSnippet = () => {
    showSnippet = !showSnippet;
  };
</script>

<div class="relative">
  <h5 class="file-name">
    <Copyable
      content={filePath}
      clickAllToCopy
      container-class="w-full"
      class="truncate"
    />
  </h5>
  <span class="details">
    <span class="text-yellow-200">{functionName}</span>
    <Icon name="chevron-right" class="text-white " />
    <svelte:element
      this={showSnippet ? 'span' : 'button'}
      class="text-[#66d9ef]"
      class:line-button={!showSnippet}
      on:click={() => {
        codeBlock
          .querySelector('.line-highlight')
          .scrollIntoView({ block: 'center' });
      }}>line {line}</svelte:element
    >
    <Icon name="chevron-right" class="text-white " />
    <span class="text-purple-200">column {column}</span>
  </span>
  <div class="relative max-h-96 overflow-scroll" bind:this={codeBlock}>
    {#key line}
      <CodeBlock
        content={showSnippet ? snippet : source}
        language="ts"
        highlightLine={line}
        copyable={false}
        {lineStart}
      />
    {/key}
  </div>
  <button
    on:click={toggleShowSnippet}
    class="absolute top-14 right-4 rounded-md bg-gray-900 opacity-90 hover:bg-white"
  >
    <Icon
      name={showSnippet ? 'chevron-selector-vertical' : 'chevron-up'}
      class="text-white hover:text-gray-900"
    />
  </button>
</div>

<style lang="postcss">
  .file-name {
    @apply rounded-tl-xl rounded-tr-xl border-2 border-b-0 border-gray-900 bg-white p-2 pb-4 -mb-4;
  }

  .details {
    @apply absolute left-0 bottom-0 bg-gray-900 w-full z-10 flex flex-row p-2;
  }

  .line-button {
    @apply hover:text-[#3cafc6];
  }
</style>
