<script lang="ts">
  import type { Snippet } from 'svelte';

  import Table from '$lib/holocene/table/table.svelte';

  import TableHeaderRow from '../table/table-header-row.svelte';
  import TableRow from '../table/table-row.svelte';

  import Skeleton from './index.svelte';

  interface Props {
    rows?: number;
    columns?: number;
    columnWidths?: number[];
    headers?: Snippet;
  }

  let {
    rows = 10,
    columns = 4,
    columnWidths = new Array(columns).fill(100 / columns),
    headers: table_headers,
  }: Props = $props();
</script>

<Table class="w-full table-fixed" variant="fancy">
  {#snippet headers()}
    <TableHeaderRow class="h-8">
      {#if table_headers}
        {@render table_headers()}
      {:else}
        {#each Array.from(new Array(columns)) as _column, i}
          <th style="width: {columnWidths[i]}%;"></th>
        {/each}
      {/if}
    </TableHeaderRow>
  {/snippet}
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
