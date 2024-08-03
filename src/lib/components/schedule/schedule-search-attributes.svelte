<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Schedule } from '$lib/types';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import { capitalize } from '$lib/utilities/format-camel-case';
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
    <Table class="w-full" variant="simple">
      <caption class="sr-only" slot="caption"
        >{translate('events.custom-search-attributes')}</caption
      >
      <TableHeaderRow slot="headers">
        <th>{capitalize(translate('events.attribute'))}</th>
        <th>{translate('common.value')}</th>
      </TableHeaderRow>
      {#each Object.entries(searchAttributes) as [searchAttrName, searchAttrValue]}
        <TableRow>
          <td>{searchAttrName}</td>
          <td>{searchAttrValue}</td>
        </TableRow>
      {/each}
    </Table>
  {/if}
</Accordion>
