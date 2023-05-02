<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import Copyable from '../copyable.svelte';
  import Link from '$lib/holocene/link.svelte';

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
    <td class="w-1/3 hover:text-blue-700 hover:underline">
      {#if first}
        <Link
          newTab
          href={routeForEventHistory({
            namespace,
            workflow: workflow,
            run: first,
          })}
        >
          <Copyable content={first} visible />
        </Link>
      {/if}
    </td>
    <td class="w-1/3 hover:text-blue-700 hover:underline">
      {#if previous}
        <Link
          newTab
          href={routeForEventHistory({
            namespace,
            workflow: workflow,
            run: previous,
          })}
        >
          <Copyable content={previous} visible />
        </Link>
      {/if}
    </td>
    <td class="w-1/3 hover:text-blue-700 hover:underline">
      {#if next}
        <Link
          newTab
          href={routeForEventHistory({
            namespace,
            workflow: workflow,
            run: next,
          })}
        >
          <Copyable content={next} visible />
        </Link>
      {/if}
    </td>
  </TableRow>
</Table>
