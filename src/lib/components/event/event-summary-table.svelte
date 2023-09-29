<script lang="ts">
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';

  export let updating = false;
</script>

<Table {updating} class="dark w-full table-fixed">
  <caption class="sr-only" slot="caption"
    >{translate('workflows', 'event-history')}</caption
  >
  <TableHeaderRow slot="headers" class="bg-[#e2e8f0]">
    <td class="w-14 xl:w-10"></td>
    <th class="w-16 md:w-32"></th>
    <th class="w-44"></th>
    <th class="w-auto xl:w-80"></th>
  </TableHeaderRow>
  <slot />
</Table>
