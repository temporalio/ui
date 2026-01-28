<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForTimeline } from '$lib/utilities/route-for';

  import WorkflowStatus from '../workflow-status.svelte';

  export let children: WorkflowExecution[] = [];

  $: ({ namespace } = $page.params);
</script>

<Pagination
  items={children}
  let:visibleItems
  aria-label={translate('workflows.child-workflows')}
  pageSizeSelectLabel={translate('common.per-page')}
  previousButtonLabel={translate('common.previous')}
  nextButtonLabel={translate('common.next')}
>
  <div slot="pagination-top"></div>
  <Table class="w-full">
    <caption class="sr-only" slot="caption"
      >{translate('workflows.child-workflows')}</caption
    >
    <TableHeaderRow slot="headers">
      <th class="max-md:hidden">{translate('common.status')}</th>
      <th class="max-lg:hidden">{translate('common.type')}</th>
      <th>{translate('workflows.child-id')}</th>
      <th>{translate('workflows.child-run-id')}</th>
    </TableHeaderRow>
    {#each visibleItems as child}
      <TableRow>
        <td class="max-md:hidden">
          <WorkflowStatus status={child.status} />
        </td>
        <td class="max-lg:hidden">
          {child.name}
        </td>
        <td class="hover:text-blue-700 hover:underline">
          <Link
            href={routeForTimeline({
              namespace,
              workflow: child.id,
              run: child.runId,
            })}
          >
            {child.id}
          </Link>
        </td>
        <td class="hover:text-blue-700 hover:underline">
          <Link
            href={routeForTimeline({
              namespace,
              workflow: child.id,
              run: child.runId,
            })}
          >
            {child.runId}
          </Link>
        </td>
      </TableRow>
    {/each}
  </Table>
</Pagination>
