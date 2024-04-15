<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import type { Payloads } from '$lib/types';
  import { getCodeBlockValue } from '$lib/utilities/get-single-attribute-for-event';

  export let key: string;
  export let value: string | Record<string, unknown> | Payloads;

  $: codeBlockValue = getCodeBlockValue(value);
  // $: stackTrace = getStackTrace(codeBlockValue);
</script>

{#if typeof value === 'object'}
  {#if value?.payloads}
    <PayloadDecoder {value} key="payloads" let:decodedValue>
      {#key decodedValue}
        {decodedValue.slice(1, 20)}
      {/key}
    </PayloadDecoder>
  {:else if key === 'searchAttributes'}
    <PayloadDecoder
      key="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      let:decodedValue
    >
      {#key decodedValue}
        {decodedValue.slice(1, 20)}
      {/key}
    </PayloadDecoder>
  {:else}
    <PayloadDecoder value={codeBlockValue} let:decodedValue>
      {#key decodedValue}
        {decodedValue.slice(1, 20)}
      {/key}
    </PayloadDecoder>
  {/if}
{/if}
