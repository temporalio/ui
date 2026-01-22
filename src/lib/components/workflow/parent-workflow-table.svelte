<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import { routeForTimeline } from '$lib/utilities/route-for';

  export let parent: WorkflowIdentifier;
  export let parentNamespaceName: string | undefined;
  export let namespace: string;
</script>

<Table class="w-full">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.parent-workflow')}</caption
  >
  <TableHeaderRow slot="headers">
    <th>{translate('workflows.parent-id')}</th>
    <th>{translate('workflows.parent-run-id')}</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        href={routeForTimeline({
          namespace: parentNamespaceName ?? namespace,
          workflow: parent.workflowId,
          run: parent.runId,
        })}
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={parent.workflowId}
          visible
        />
      </Link>
    </td>
    <td>
      <Link
        href={routeForTimeline({
          namespace: parentNamespaceName ?? namespace,
          workflow: parent.workflowId,
          run: parent.runId,
        })}
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={parent.runId}
          visible
        />
      </Link>
    </td>
  </TableRow>
</Table>
