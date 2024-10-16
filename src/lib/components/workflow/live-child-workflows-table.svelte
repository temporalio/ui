<script lang="ts">
  import { page } from '$app/stores';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import PayloadDecoder from '../event/payload-decoder.svelte';
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
  <div slot="pagination-top" />
  <Table class="w-full">
    <caption class="sr-only" slot="caption"
      >{translate('workflows.child-workflows')}</caption
    >
    <TableHeaderRow slot="headers">
      <th class="max-md:hidden">{translate('common.status')}</th>
      <th class="max-lg:hidden">{translate('common.type')}</th>
      <th>{translate('workflows.child-id')}</th>
      <th>{translate('workflows.child-run-id')}</th>
      <th>{translate('common.memo')}</th>
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
            href={routeForEventHistory({
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
            href={routeForEventHistory({
              namespace,
              workflow: child.id,
              run: child.runId,
            })}
          >
            {child.runId}
          </Link>
        </td>
        <td>
          <PayloadDecoder value={child.memo} key="fields" let:decodedValue>
            <CodeBlock content={decodedValue} />
          </PayloadDecoder>
        </td>
      </TableRow>
    {/each}
  </Table>
</Pagination>
