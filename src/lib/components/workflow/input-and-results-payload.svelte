<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payload } from '$lib/types';
  import type { PotentiallyDecodable } from '$lib/utilities/decode-payload';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  type Props = {
    title: string;
    content: string;
    isRunning: boolean;
  };
  let { title, content = '', isRunning = false }: Props = $props();
  let inline = $state(false);

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
  <h3 class="flex items-center gap-2">
    {title}
  </h3>
  {#if content}
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
                maxHeight={300}
                {inline}
              />
            {/each}
          {:else}
            <CodeBlock
              content={decodedValue}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
              maxHeight={300}
              {inline}
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
            maxHeight={300}
            {inline}
          />
        {/snippet}
      </PayloadDecoder>
    {/if}
  {:else}
    <CodeBlock
      content={isRunning ? 'Results will appear upon completion.' : 'null'}
      language="text"
      copyable={false}
      maxHeight={300}
      {inline}
    />
  {/if}
</div>
