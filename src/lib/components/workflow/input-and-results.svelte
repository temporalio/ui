<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  export let content: string;
  export let title: string;

  let parsedContent = [];
  let showIndividually = false;

  const parseContent = () => {
    try {
      const result = JSON.parse(content);
      if (Array.isArray(result)) {
        parsedContent = result;
      }
    } catch {
      // do nothing
    }
  };

  $: content && parseContent();
</script>

<article class="flex w-full flex-col lg:w-1/2" {...$$restProps}>
  <div class="flex flex-col sm:flex-row justify-between min-h-[32px] mb-2">
    <h3 class="text-lg">{title}</h3>
    {#if parsedContent.length > 0}
      <label
        for="{title}-show-individually"
        class="flex items-center gap-4 font-secondary text-sm"
        data-testid="{title}-show-individually"
        >Show individually
        <ToggleSwitch
          id="{title}-show-individually"
          bind:checked={showIndividually}
        />
      </label>
    {/if}
  </div>
  {#if content}
    {#if showIndividually}
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
