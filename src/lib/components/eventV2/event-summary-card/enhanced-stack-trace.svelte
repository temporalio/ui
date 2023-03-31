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

  let showSnippet = true;

  $: lineStart = showSnippet ? line - 4 : 1;
</script>

<h5 class="file-name">
  <Copyable
    content={filePath}
    clickAllToCopy
    container-class="w-full"
    class="truncate"
  />
</h5>
<div class="max-h-96 overflow-scroll">
  <CodeBlock
    content={showSnippet ? snippet : source}
    language="ts"
    highlightLine={line}
    copyable={false}
    {lineStart}
  >
    <button
      slot="action"
      on:click={() => {
        showSnippet = !showSnippet;
      }}
      class="absolute top-2.5 right-2.5 rounded-md bg-gray-900 opacity-90 hover:bg-white"
    >
      <Icon
        name={showSnippet ? 'chevron-selector-vertical' : 'chevron-up'}
        class="text-white hover:text-gray-900"
      />
    </button></CodeBlock
  >
</div>

<style lang="postcss">
  .file-name {
    @apply rounded-tl-xl rounded-tr-xl border-2 border-b-0 border-gray-900 bg-white p-2 pb-4 -mb-4;
  }
</style>
