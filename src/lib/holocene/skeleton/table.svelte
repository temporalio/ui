<script lang="ts">
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '../table/table-header-row.svelte';
  import TableRow from '../table/table-row.svelte';
  import Skeleton from './index.svelte';

  export let rows = 10;
  export let columns = 4;
  export let columnWidths: number[] = new Array(columns).fill(100 / columns);
</script>

<Table class="w-full table-fixed" variant="fancy">
  <TableHeaderRow slot="headers" class="h-8">
    <slot name="headers">
      {#each Array.from(new Array(columns)) as _column, i}
        <th style="width: {columnWidths[i]}%;" />
      {/each}
    </slot>
  </TableHeaderRow>
  {#each Array.from(Array(rows).keys()) as _row}
    <TableRow>
      {#each Array.from(new Array(columns)) as _column}
        <td style="padding-right: 0.5rem;">
          <Skeleton class="h-4 w-full" />
        </td>
      {/each}
    </TableRow>
  {/each}
</Table>
