<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttribute } from '$lib/types';
  import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
  import { payloadToString } from '$lib/utilities/payload-to-string';
  import { pluralize } from '$lib/utilities/pluralize';

  let { searchAttributes }: { searchAttributes: SearchAttribute } = $props();

  const decodedSearchAttributes = $derived(
    parsePayloadAttributes({ searchAttributes }),
  );
  const indexedFields = $derived(
    decodedSearchAttributes?.searchAttributes.indexedFields ?? {},
  );
  const searchAttributeCount = $derived(Object.keys(indexedFields).length);
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
        {@const value = payloadToString(searchAttrValue)}
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
