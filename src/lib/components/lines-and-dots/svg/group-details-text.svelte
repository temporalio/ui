<script lang="ts">
  import EventDetailsLink from '$lib/components/event/event-details-link.svelte';
  import Payload from '$lib/components/payload/payload.svelte';
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
    <Payload
      {value}
      key="payloads"
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
      {onDecode}
    />
  {:else if key === 'searchAttributes'}
    <Payload
      key="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
      {onDecode}
    />
  {:else}
    <Payload
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
