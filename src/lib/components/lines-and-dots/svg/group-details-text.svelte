<script lang="ts">
  import EventDetailsLink from '$lib/components/event/event-details-link.svelte';
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    displayLinkType,
    getCodeBlockValue,
  } from '$lib/utilities/get-single-attribute-for-event';

  import { DetailsConfig, staticCodeBlockHeight } from '../constants';

  interface Props {
    key: string;
    value: string | Record<string, unknown>;
    attributes: CombinedAttributes;
    onDecode?: (decodedValue: string) => void | undefined;
  }

  let { key, value, attributes, onDecode = undefined }: Props = $props();

  const { fontSizeRatio } = DetailsConfig;

  const codeBlockValue = $derived(getCodeBlockValue(value));
  const linkType = $derived(displayLinkType(key, attributes));
</script>

{#if typeof value === 'object'}
  {#if value?.payloads}
    <PayloadDecoder {value} key="payloads" {onDecode}>
      {#snippet children(decodedValue)}
        {#key decodedValue}
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        {/key}
      {/snippet}
    </PayloadDecoder>
  {:else if key === 'searchAttributes'}
    <PayloadDecoder
      key="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      {onDecode}
    >
      {#snippet children(decodedValue)}
        {#key decodedValue}
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        {/key}
      {/snippet}
    </PayloadDecoder>
  {:else}
    <PayloadDecoder value={codeBlockValue} {onDecode}>
      {#snippet children(decodedValue)}
        {#key decodedValue}
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        {/key}
      {/snippet}
    </PayloadDecoder>
  {/if}
{:else if linkType !== 'none'}
  <EventDetailsLink {value} {attributes} type={linkType} />
{:else}
  {value}
{/if}
