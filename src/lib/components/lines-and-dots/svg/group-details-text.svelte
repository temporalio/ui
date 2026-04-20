<script lang="ts">
  import EventDetailsLink from '$lib/components/event/event-details-link.svelte';
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
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
    <PayloadCodeBlock
      {value}
      fieldName="payloads"
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
      {onDecode}
    />
  {:else if key === 'searchAttributes'}
    <PayloadCodeBlock
      fieldName="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
      {onDecode}
    />
  {:else}
    <PayloadCodeBlock
      value={codeBlockValue}
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
      {onDecode}
    />
  {/if}
{:else if linkType !== 'none'}
  <EventDetailsLink {value} {attributes} type={linkType} />
{:else}
  {value}
{/if}
