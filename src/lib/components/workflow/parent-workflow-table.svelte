<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import Copyable from '../copyable.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  export let parent: WorkflowIdentifier;
  export let parentNamespaceName: string | undefined;
  export let namespace: string;
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th>{translate('workflows', 'parent-id')}</th>
    <th>{translate('workflows', 'parent-run-id')}</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        newTab
        href={routeForEventHistory({
          namespace: parentNamespaceName ?? namespace,
          workflow: parent.workflowId,
          run: parent.runId,
        })}
      >
        <Copyable content={parent.workflowId} visible />
      </Link>
    </td>
    <td>
      <Link
        newTab
        href={routeForEventHistory({
          namespace: parentNamespaceName ?? namespace,
          workflow: parent.workflowId,
          run: parent.runId,
        })}
      >
        <Copyable content={parent.runId} visible />
      </Link>
    </td>
  </TableRow>
</Table>
