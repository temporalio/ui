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
  export let point: [number, number] = [0, 0];
  export let width: number;

  const { fontSizeRatio } = DetailsConfig;

  $: [x, y] = point;
  $: codeBlockValue = getCodeBlockValue(value);
  $: linkType = displayLinkType(key, attributes);
</script>

{#if typeof value === 'object'}
  {#if value?.payloads}
    <PayloadDecoder {value} key="payloads" let:decodedValue>
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          {width}
          height={staticCodeBlockHeight - fontSizeRatio}
        >
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        </foreignObject>
      {/key}
    </PayloadDecoder>
  {:else if key === 'searchAttributes'}
    <PayloadDecoder
      key="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      let:decodedValue
    >
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          {width}
          height={staticCodeBlockHeight - fontSizeRatio}
        >
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        </foreignObject>
      {/key}
    </PayloadDecoder>
  {:else}
    <PayloadDecoder value={codeBlockValue} let:decodedValue>
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          {width}
          height={staticCodeBlockHeight - fontSizeRatio}
        >
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        </foreignObject>
      {/key}
    </PayloadDecoder>
  {/if}
{:else if linkType !== 'none'}
  <EventDetailsLink {value} {attributes} type={linkType} light />
{:else}
  {value}
{/if}
