<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';

  import {
    getPayloads,
    parseContent,
    parsePayloads,
  } from './input-and-result-payloads';
  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let title: string;
  export let content: string;
  export let isRunning: boolean;

  $: parsedContent = parseContent(content);
  $: payloads = getPayloads(parsedContent);
  $: showParsedContent = payloads.length > 0;
</script>

<div class="flex w-full grow flex-col py-4 {$$restProps.class}">
  <h3 class="flex items-center gap-2 pl-4 text-lg text-white">
    {title}
  </h3>
  <div class="flex h-full flex-col gap-0 overflow-scroll">
    {#if content}
      {#if showParsedContent}
        <PayloadDecoder value={parsedContent} key="payloads" let:decodedValue>
          {#each parsePayloads(decodedValue) as decodedContent}
            <CodeBlock
              content={stringifyWithBigInt(decodedContent)}
              class="rounded-none"
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          {/each}
        </PayloadDecoder>
      {:else}
        <PayloadDecoder value={parseWithBigInt(content)} let:decodedValue>
          <CodeBlock
            content={decodedValue}
            class="rounded-none"
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </PayloadDecoder>
      {/if}
    {:else}
      <CodeBlock
        content={isRunning ? 'Results will appear upon completion.' : 'null'}
        language="text"
        copyable={false}
      />
    {/if}
  </div>
</div>
