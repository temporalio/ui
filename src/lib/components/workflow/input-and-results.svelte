<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let content: string;
  export let title: string;

  $: parsedContent = parseContent(content);
  $: showParsedContent = parsedContent.length > 0;
  $: showParsedContentCount = parsedContent.length > 1;

  const parseContent = (c: string): unknown[] => {
    try {
      const result = JSON.parse(c);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  };
</script>

<article class="flex w-full flex-col lg:w-1/2" {...$$restProps}>
  <h3 class="mb-2 flex items-center gap-2 text-lg">
    {title}
    {#if showParsedContentCount}
      <Badge type="count" class="rounded-sm">{parsedContent.length}</Badge>
    {/if}
  </h3>
  {#if content}
    <div class="flex h-full flex-col overflow-scroll lg:max-h-[24rem]">
      {#if showParsedContent}
        {#each parsedContent as content}
          <PayloadDecoder value={content} let:decodedValue>
            <CodeBlock
              content={decodedValue}
              class="mb-2"
              copyIconTitle={translate('copy-icon-title')}
              copySuccessIconTitle={translate('copy-success-icon-title')}
            />
          </PayloadDecoder>
        {/each}
      {:else}
        <PayloadDecoder value={parseWithBigInt(content)} let:decodedValue>
          <CodeBlock
            content={decodedValue}
            class="mb-2 lg:max-h-[23.5rem]"
            copyIconTitle={translate('copy-icon-title')}
            copySuccessIconTitle={translate('copy-success-icon-title')}
          />
        </PayloadDecoder>
      {/if}
    </div>
  {:else}
    <CodeBlock
      content="Results will appear upon completion."
      language="text"
      class="mb-2 lg:max-h-[24rem]"
      copyable={false}
    />
  {/if}
</article>
