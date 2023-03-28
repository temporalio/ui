<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Badge from '$lib/holocene/badge.svelte';

  export let content: string;
  export let title: string;

  $: parsedContent = parseContent(content);
  $: showParsedContent = parsedContent.length > 0;
  $: showParsedContentCount = parsedContent.length > 1;

  const parseContent = (c: string): string[] => {
    try {
      const result = JSON.parse(c);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  };
</script>

<article class="flex w-full flex-col lg:w-1/2" {...$$restProps}>
  <h3 class="text-lg flex items-center gap-2 mb-2">
    {title}
    {#if showParsedContentCount}
      <Badge type="count" class="rounded-sm">{parsedContent.length}</Badge>
    {/if}
  </h3>
  {#if content}
    {#if showParsedContent}
      <div class="flex flex-col h-full lg:max-h-[24rem] overflow-scroll">
        {#each parsedContent as content}
          <CodeBlock content={JSON.stringify(content)} class="mb-2" />
        {/each}
      </div>
    {:else}
      <CodeBlock {content} class="mb-2 lg:max-h-[23.5rem]" />
    {/if}
  {:else}
    <CodeBlock
      content="Results will appear upon completion."
      language="text"
      class="mb-2 lg:max-h-[24rem]"
      copyable={false}
    />
  {/if}
</article>
