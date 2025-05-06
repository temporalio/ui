<script lang="ts">
  import EventDetailsLink from '$lib/components/event/event-details-link.svelte';
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { format } from '$lib/utilities/format-camel-case';
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
    <div>
      <div class="font-medium leading-4 text-secondary">
        {format(key)}
      </div>
      <PayloadDecoder {value} key="payloads" let:decodedValue {onDecode}>
        {#key decodedValue}
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        {/key}
      </PayloadDecoder>
    </div>
  {:else if key === 'searchAttributes'}
    <div>
      <div class="font-medium leading-4 text-secondary">
        {format(key)}
      </div>
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
    </div>
  {:else if Object.keys(value).length > 0}
    <div>
      <div class="font-medium leading-4 text-secondary">
        {format(key)}
      </div>
      <PayloadDecoder value={codeBlockValue} let:decodedValue {onDecode}>
        {#key decodedValue}
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
        {/key}
      </PayloadDecoder>
    </div>
  {/if}
{:else if linkType !== 'none'}
  <div>
    <div class="font-medium leading-4 text-secondary">
      {format(key)}
    </div>
    <EventDetailsLink {value} {attributes} type={linkType} />
  </div>
{:else}
  <div>
    <div class="font-medium leading-4 text-secondary">
      {format(key)}
    </div>
    <div class="text-wrap break-all leading-4">
      {value}
    </div>
  </div>
{/if}
