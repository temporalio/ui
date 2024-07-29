<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Schedule } from '$lib/types';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';

  export let schedule: Schedule | undefined;

  $: decodedPaylod = decodePayloadAttributes(schedule?.action?.startWorkflow);
  $: searchAttributes = decodedPaylod?.searchAttributes?.indexedFields ?? {};
</script>

<Accordion title={translate('common.search-attributes')}>
  <Table class="w-full" variant="simple">
    <caption class="sr-only" slot="caption"
      >{translate('common.search-attributes')}</caption
    >
    <TableHeaderRow slot="headers">
      <th>{translate('workflows.custom-search-attribute')}</th>
      <th>{translate('common.value')}</th>
    </TableHeaderRow>
    {#each Object.entries(searchAttributes) as [searchAttrName, searchAttrValue]}
      <TableRow>
        <td>{searchAttrName}</td>
        <td>{searchAttrValue}</td>
      </TableRow>
    {/each}
  </Table>
</Accordion>
