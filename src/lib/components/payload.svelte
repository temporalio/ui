<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Memo, Payload as RawPayload } from '$lib/types';
  import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
  import {
    cloneAllPotentialPayloadsWithCodec,
    decodePayloadAttributes,
    decodeSingleReadablePayloadWithCodec,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import {
    getCodecEndpoint,
    getCodecIncludeCredentials,
    getCodecPassAccessToken,
  } from '$lib/utilities/get-codec';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import type { EditorLanguage } from '$lib/vendor/codemirror/custom-extensions';

  type DisplayMode = 'code-block' | 'summary' | 'inline-truncated';

  interface Props {
    value:
      | PotentiallyDecodable
      | EventAttribute
      | WorkflowEvent
      | Memo
      | RawPayload
      | null
      | undefined;
    key?: string;
    mode?: DisplayMode;
    maxHeight?: number;
    copyIconTitle?: string;
    copySuccessIconTitle?: string;
    testId?: string;
    language?: EditorLanguage;
    fallback?: string;
    prefix?: string;
    maxSummaryLength?: number;
    truncateAt?: number;
    class?: string;
    onDecode?: (decodedValue: string) => void;
    children?: Snippet<[decodedValue: string]>;
  }

  let {
    value,
    key = '',
    mode = 'code-block',
    maxHeight,
    copyIconTitle = '',
    copySuccessIconTitle = '',
    testId,
    language = 'json',
    fallback = '',
    prefix = '',
    maxSummaryLength = 120,
    truncateAt = 60,
    class: className = '',
    onDecode,
    children,
  }: Props = $props();

  const getSettings = () => ({
    ...page.data.settings,
    codec: {
      ...page.data.settings?.codec,
      endpoint: getCodecEndpoint(page.data.settings),
      passAccessToken: getCodecPassAccessToken(page.data.settings),
      includeCredentials: getCodecIncludeCredentials(page.data.settings),
    },
  });

  const getInitialValue = () => {
    if (!value) return fallback || stringifyWithBigInt(value);
    const keyedValue = key && value?.[key] ? value[key] : value;
    return stringifyWithBigInt(keyedValue);
  };

  let decodedValue = $state(getInitialValue());

  const applyPrefix = (text: string): string => {
    if (!prefix) return text;
    const prefixed = `${prefix} • ${text}`;
    if (prefixed.length <= maxSummaryLength) return prefixed;
    return prefixed.slice(0, maxSummaryLength) + '...';
  };

  const decodeForCodeBlock = async () => {
    if (!value) return;
    const settings = getSettings();
    try {
      const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
        value as PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
        page.params.namespace,
        settings,
      );
      const decodedAttributes = decodePayloadAttributes(
        convertedAttributes,
      ) as object;
      const keyExists = key && decodedAttributes?.[key];
      let finalValue = keyExists ? decodedAttributes[key] : decodedAttributes;
      if (Array.isArray(finalValue) && finalValue.length === 1) {
        finalValue = finalValue[0];
      }
      decodedValue = stringifyWithBigInt(finalValue);
      onDecode?.(decodedValue);
    } catch {
      console.error('Could not decode payloads');
    }
  };

  const decodeForSummary = async () => {
    if (!value) {
      decodedValue = fallback;
      return;
    }
    try {
      const settings = getSettings();
      const result = await decodeSingleReadablePayloadWithCodec(
        value as RawPayload,
        settings,
      );
      if (typeof result === 'string' && result) {
        decodedValue = applyPrefix(result);
        onDecode?.(decodedValue);
      } else {
        decodedValue = fallback;
      }
    } catch {
      decodedValue = fallback;
    }
  };

  onMount(() => {
    if (mode === 'summary') {
      decodeForSummary();
    } else {
      decodeForCodeBlock();
    }
  });
</script>

{#if children}
  {@render children(decodedValue)}
{:else if mode === 'code-block'}
  <CodeBlock
    content={decodedValue}
    {maxHeight}
    {copyIconTitle}
    {copySuccessIconTitle}
    {testId}
    {language}
  />
{:else if mode === 'summary'}
  <Badge type="secondary" class={className}>
    {decodedValue || fallback}
  </Badge>
{:else if mode === 'inline-truncated'}
  <div class="payload {className}">
    <code>
      <pre class="truncate">{decodedValue.slice(0, truncateAt)}</pre>
    </code>
  </div>
{/if}

<style lang="postcss">
  .payload {
    @apply overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs;
  }

  .payload code {
    @apply text-primary;
  }

  .payload pre {
    @apply text-primary;
  }
</style>
