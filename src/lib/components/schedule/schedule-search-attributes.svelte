<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Schedule } from '$lib/types';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import { pluralize } from '$lib/utilities/pluralize';

  export let schedule: Schedule | undefined;

  $: decodedPaylod = decodePayloadAttributes(schedule?.action?.startWorkflow);
  $: searchAttributes = decodedPaylod?.searchAttributes?.indexedFields ?? {};

  $: searchAttributeCount = Object.keys(searchAttributes).length;
</script>

<Accordion
  title={translate('events.custom-search-attributes')}
  subtitle={`${searchAttributeCount} ${translate(
    'events.custom-search',
  )} ${pluralize(translate('events.attribute'), searchAttributeCount)}`}
>
  {#if searchAttributeCount}
    <ul class="w-full">
      {#each Object.entries(searchAttributes) as [searchAttrName, searchAttrValue]}
        <li
          class="flex flex-wrap items-center gap-2 border-b py-2 last-of-type:border-b-0"
        >
          <span class="break-all">{searchAttrName}</span>
          <span class="surface-subtle select-all rounded-sm p-1 leading-4"
            >{searchAttrValue}</span
          >
        </li>
      {/each}
    </ul>
  {/if}
</Accordion>
