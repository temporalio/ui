<script lang="ts">
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventClassification } from '$lib/types/events';
  import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';
  import type { ChildWorkflowClosedEvent } from '$lib/utilities/get-workflow-relationships';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  interface Props {
    children?: ChildWorkflowClosedEvent[];
    pendingChildren?: WorkflowExecution['pendingChildren'];
    namespace: string;
  }

  let { children = [], pendingChildren = [], namespace }: Props = $props();

  const toChildWorkflowStatus = (
    status: EventClassification,
  ): WorkflowStatus => {
    switch (status) {
      case 'Running':
      case 'Completed':
      case 'Failed':
      case 'Canceled':
      case 'TimedOut':
      case 'Terminated':
        return status;
      default:
        return null;
    }
  };

  const formattedPending = $derived(
    pendingChildren.map((c) => {
      return {
        runId: c.runId ?? '',
        workflowId: c.workflowId ?? '',
        status: 'Running' as const,
        type: c.workflowTypeName,
        namespace,
      };
    }),
  );

  const formattedCompleted = $derived(
    children.map((c) => {
      return {
        runId: c.attributes.workflowExecution?.runId ?? '',
        workflowId: c.attributes.workflowExecution?.workflowId ?? '',
        type: c.attributes.workflowType,
        status: toChildWorkflowStatus(c.classification),
        namespace: c.attributes?.namespace || namespace,
      };
    }),
  );

  const formattedAll = $derived([...formattedPending, ...formattedCompleted]);
</script>

<Pagination
  items={formattedAll}
  aria-label={translate('workflows.child-workflows')}
  pageSizeSelectLabel={translate('common.per-page')}
  previousButtonLabel={translate('common.previous')}
  nextButtonLabel={translate('common.next')}
>
  {#snippet paginationTop()}
    <div></div>
  {/snippet}
  {#snippet children({ visibleItems })}
    <Table class="w-full">
      {#snippet caption()}
        <caption class="sr-only"
          >{translate('workflows.child-workflows')}</caption
        >
      {/snippet}
      {#snippet headers()}
        <TableHeaderRow>
          <th scope="col" class="max-md:hidden">{translate('common.status')}</th
          >
          <th scope="col" class="max-lg:hidden">{translate('common.type')}</th>
          <th scope="col">{translate('workflows.child-id')}</th>
          <th scope="col">{translate('workflows.child-run-id')}</th>
        </TableHeaderRow>
      {/snippet}
      {#each visibleItems as child}
        <TableRow>
          <td class="max-md:hidden">
            <WorkflowStatusBadge status={child.status} />
          </td>
          <td class="max-lg:hidden">
            {child.type}
          </td>
          <td class="hover:text-brand hover:underline">
            <Link
              href={routeForWorkflow({
                namespace: child.namespace,
                workflow: child.workflowId,
                run: child.runId,
              })}
            >
              {child.workflowId}
            </Link>
          </td>
          <td class="hover:text-brand hover:underline">
            <Link
              href={routeForWorkflow({
                namespace: child.namespace,
                workflow: child.workflowId,
                run: child.runId,
              })}
            >
              {child.runId}
            </Link>
          </td>
        </TableRow>
      {/each}
    </Table>
  {/snippet}
</Pagination>
