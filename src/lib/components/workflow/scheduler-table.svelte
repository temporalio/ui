<script lang="ts">
  import { routeForSchedule } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import Copyable from '../copyable.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  export let scheduleId: string;
  export let namespace: string;
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th>{translate('schedule')}</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        newTab
        href={routeForSchedule({
          namespace: namespace,
          scheduleId,
        })}
      >
        <Copyable content={scheduleId} visible />
      </Link>
    </td>
  </TableRow>
</Table>
