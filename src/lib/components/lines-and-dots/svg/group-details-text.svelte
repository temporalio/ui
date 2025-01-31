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

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let onDecode: (decodedValue: string) => void | undefined = undefined;

  const { fontSizeRatio } = DetailsConfig;

  $: codeBlockValue = getCodeBlockValue(value);
  $: linkType = displayLinkType(key, attributes);
</script>

{#if typeof value === 'object'}
  {#if value?.payloads}
    <PayloadDecoder {value} key="payloads" let:decodedValue {onDecode}>
      {#key decodedValue}
        <CodeBlock
          content={decodedValue}
          maxHeight={staticCodeBlockHeight - fontSizeRatio}
        />
      {/key}
    </PayloadDecoder>
  {:else if key === 'searchAttributes'}
    <PayloadDecoder
      key="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      let:decodedValue
      {onDecode}
    >
      {#key decodedValue}
        <CodeBlock
          content={decodedValue}
          maxHeight={staticCodeBlockHeight - fontSizeRatio}
        />
      {/key}
    </PayloadDecoder>
  {:else}
    <PayloadDecoder value={codeBlockValue} let:decodedValue {onDecode}>
      {#key decodedValue}
        <CodeBlock
          content={decodedValue}
          maxHeight={staticCodeBlockHeight - fontSizeRatio}
        />
      {/key}
    </PayloadDecoder>
  {/if}
{:else if linkType !== 'none'}
  <EventDetailsLink {value} {attributes} type={linkType} />
{:else}
  {value}
{/if}
