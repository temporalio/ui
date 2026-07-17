<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  interface Props {
    parent: WorkflowIdentifier;
    parentNamespaceName: string | undefined;
    namespace: string;
  }

  let { parent, parentNamespaceName, namespace }: Props = $props();

  const workflowId = $derived(parent.workflowId ?? '');
  const runId = $derived(parent.runId ?? '');
</script>

<Table class="w-full">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.parent-workflow')}</caption
  >
  <TableHeaderRow slot="headers">
    <th scope="col">{translate('workflows.parent-id')}</th>
    <th scope="col">{translate('workflows.parent-run-id')}</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        href={routeForWorkflow({
          namespace: parentNamespaceName ?? namespace,
          workflow: workflowId,
          run: runId,
        })}
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={workflowId}
          visible
        />
      </Link>
    </td>
    <td>
      <Link
        href={routeForWorkflow({
          namespace: parentNamespaceName ?? namespace,
          workflow: workflowId,
          run: runId,
        })}
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={runId}
          visible
        />
      </Link>
    </td>
  </TableRow>
</Table>
