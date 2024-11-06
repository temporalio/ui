<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payload, SearchAttribute } from '$lib/types';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import { pluralize } from '$lib/utilities/pluralize';

  export let searchAttributes: SearchAttribute;

  $: decodedSearchAttributes = decodePayloadAttributes({ searchAttributes });
  $: indexedFields =
    decodedSearchAttributes?.searchAttributes.indexedFields ?? {};
  $: searchAttributeCount = Object.keys(indexedFields).length;

  const formatValue = (value: Payload) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };
</script>

<Accordion
  title={translate('events.custom-search-attributes')}
  subtitle={`${searchAttributeCount} ${translate(
    'events.custom-search',
  )} ${pluralize(translate('events.attribute'), searchAttributeCount)}`}
  expandable={searchAttributeCount > 0}
>
  {#if searchAttributeCount}
    <ul class="w-full">
      {#each Object.entries(indexedFields) as [searchAttrName, searchAttrValue]}
        {@const value = formatValue(searchAttrValue)}
        <li
          class="flex flex-wrap items-center gap-2 border-b py-2 last-of-type:border-b-0"
        >
          <span class="break-all">{searchAttrName}</span>
          <span class="surface-subtle select-all rounded-sm p-1 leading-4"
            >{value}</span
          >
        </li>
      {/each}
    </ul>
  {/if}
</Accordion>
