<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForSchedule } from '$lib/utilities/route-for';

  export let scheduleId: string;
  export let namespace: string;
</script>

<Table class="w-full">
  <caption class="sr-only" slot="caption"
    >{translate('schedules.schedule')}</caption
  >
  <TableHeaderRow slot="headers">
    <th>{translate('schedules.schedule')}</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        href={routeForSchedule({
          namespace: namespace,
          scheduleId,
        })}
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={scheduleId}
          visible
        />
      </Link>
    </td>
  </TableRow>
</Table>
