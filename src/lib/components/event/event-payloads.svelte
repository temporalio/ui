<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import { format } from '$lib/utilities/format-camel-case';
  import {
    getCodeBlockValue,
    getStackTrace,
  } from '$lib/utilities/get-single-attribute-for-event';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  import EventLlmMetadata from './event-llm-metadata.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { payloadFields }: { payloadFields: [string, any][] } = $props();
  let decodedPayloads = $state<string[]>([]);

  const getLLMMetadata = (value: string): { promptKey: string } | null => {
    try {
      const jsonValue = parseWithBigInt(value);

      if (
        jsonValue &&
        typeof jsonValue === 'object' &&
        '_details' in jsonValue
      ) {
        return { promptKey: jsonValue?._details?.promptKey ?? '' };
      }
    } catch {
      return null;
    }

    return null;
  };

  const getLLMInput = (value: string, promptKey: string): string => {
    if (!promptKey) {
      return '';
    }

    try {
      const jsonValue = parseWithBigInt(value);
      return jsonValue?.[promptKey] ?? '';
    } catch {
      return '';
    }
  };

  const setDecodedPayload = (index: number, decodedValue: string): void => {
    const nextDecodedPayloads = decodedPayloads.slice();
    nextDecodedPayloads[index] = decodedValue;
    decodedPayloads = nextDecodedPayloads;
  };

  const llmPromptKeys = $derived.by(() => {
    let currentPromptKey = '';

    return payloadFields.map((_, index) => {
      const decodedValue = decodedPayloads[index];
      const metadata = decodedValue ? getLLMMetadata(decodedValue) : null;

      if (metadata) {
        currentPromptKey = metadata.promptKey;
        return '';
      }

      return currentPromptKey;
    });
  });
</script>

{#each payloadFields as [key, value], index (key)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div>
    <p class="mb-1 min-w-56 text-sm font-medium text-secondary">
      {format(key)}
    </p>
    {#if value?.payloads}
      <PayloadDecoder
        {value}
        key="payloads"
        onDecode={(decodedValue) => setDecodedPayload(index, decodedValue)}
      >
        {#snippet children(decodedValue)}
          {@const llmMetadata = getLLMMetadata(decodedValue)}
          {@const llmPromptKey = llmPromptKeys[index] ?? ''}
          {#if llmMetadata}
            <EventLlmMetadata value={decodedValue} />
          {:else if llmPromptKey}
            {@const llmInputValue = getLLMInput(decodedValue, llmPromptKey)}
            <CodeBlock
              content={llmInputValue}
              maxHeight={384}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          {:else}
            <CodeBlock
              content={decodedValue}
              maxHeight={384}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          {/if}
        {/snippet}
      </PayloadDecoder>
    {:else if key === 'searchAttributes'}
      <PayloadDecoder
        key="searchAttributes"
        value={{ searchAttributes: codeBlockValue }}
      >
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else}
      <PayloadDecoder value={codeBlockValue}>
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {/if}
  </div>
  {#if stackTrace}
    <div>
      <p class="mb-1 min-w-56 text-sm font-medium text-secondary">
        {translate('workflows.call-stack-tab')}
      </p>
      <CodeBlock
        content={stackTrace}
        language="text"
        maxHeight={384}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/each}
