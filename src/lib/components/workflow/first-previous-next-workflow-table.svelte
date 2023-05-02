<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import Copyable from '../copyable.svelte';
  import { isFilterKey } from '$lib/utilities/query/list-workflow-query';

  export let workflow: string;
  export let namespace: string;

  export let first: string;
  export let next: string;
  export let previous: string;
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th>First Execution</th>
    <th>Previous Execution</th>
    <th>Next Execution</th>
  </TableHeaderRow>
  <TableRow>
    <td class="hover:text-blue-700 hover:underline w-1/3">
      {#if first}
        <a
          href={routeForEventHistory({
            namespace,
            workflow: workflow,
            run: first,
          })}
        >
          <Copyable content={first} visible />
        </a>
      {/if}
    </td>
    <td class="hover:text-blue-700 hover:underline w-1/3">
      {#if previous}
        <a
          href={routeForEventHistory({
            namespace,
            workflow: workflow,
            run: previous,
          })}
        >
          <Copyable content={previous} visible />
        </a>
      {/if}
    </td>
    <td class="hover:text-blue-700 hover:underline w-1/3">
      {#if next}
        <a
          href={routeForEventHistory({
            namespace,
            workflow: workflow,
            run: next,
          })}
        >
          <Copyable content={next} visible />
        </a>
      {/if}
    </td>
  </TableRow>
</Table>
