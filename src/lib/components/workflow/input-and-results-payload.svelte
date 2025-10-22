<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { minimizeEventView } from '$lib/stores/event-view';
  import type { Payload } from '$lib/types';
  import type { PotentiallyDecodable } from '$lib/utilities/decode-payload';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  type Props = {
    title: string;
    showTitle?: boolean;
    content: string;
    isRunning: boolean;
    maxHeight?: number | undefined;
  };
  let {
    title,
    showTitle = true,
    content,
    isRunning,
    maxHeight = 300,
  }: Props = $props();

  const parseContent = (c: string): PotentiallyDecodable | undefined => {
    try {
      return parseWithBigInt(c);
    } catch {
      return undefined;
    }
  };

  const parsePayloads = (c: string): unknown[] => {
    try {
      const data = parseWithBigInt(c);
      return Array.isArray(data) ? data : [data];
    } catch {
      return [];
    }
  };

  const getPayloads = (value: PotentiallyDecodable | undefined): Payload[] => {
    try {
      const payloads = value?.payloads;
      return Array.isArray(payloads) ? payloads : [];
    } catch {
      return [];
    }
  };

  const parsedContent = $derived(parseContent(content));
  const payloads = $derived(getPayloads(parsedContent));
  const payloadsSize = $derived(payloads.length);
</script>

<div class="flex w-full grow flex-col gap-2">
  {#if showTitle}
    <h2 class="flex items-center gap-2">
      {title}
    </h2>
  {/if}
  {#if content}
    {#key $minimizeEventView}
      {#if payloadsSize > 0}
        <PayloadDecoder value={parsedContent} key="payloads">
          {#snippet children(decodedValue)}
            {#if payloadsSize > 1}
              {#each parsePayloads(decodedValue) as decodedContent}
                <CodeBlock
                  content={stringifyWithBigInt(decodedContent)}
                  copyIconTitle={translate('common.copy-icon-title')}
                  copySuccessIconTitle={translate(
                    'common.copy-success-icon-title',
                  )}
                  {maxHeight}
                />
              {/each}
            {:else}
              <CodeBlock
                content={decodedValue}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
                {maxHeight}
              />
            {/if}
          {/snippet}
        </PayloadDecoder>
      {:else}
        <PayloadDecoder value={parseWithBigInt(content)}>
          {#snippet children(decodedValue)}
            <CodeBlock
              content={decodedValue}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
              {maxHeight}
            />
          {/snippet}
        </PayloadDecoder>
      {/if}
    {/key}
  {:else}
    <CodeBlock
      content={isRunning ? 'Results will appear upon completion.' : 'null'}
      language="text"
      copyable={false}
      {maxHeight}
    />
  {/if}
</div>
