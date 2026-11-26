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
    bordered?: boolean;
    headers?: Snippet;
  }

  let {
    rows = 10,
    columns = 4,
    columnWidths,
    bordered = true,
    headers: headersSnippet,
  }: Props = $props();

  const widths = $derived(
    columnWidths ?? new Array(columns).fill(100 / columns),
  );
</script>

<Table class="w-full" fixed {bordered}>
  {#snippet headers()}
    <TableHeaderRow class="h-8">
      {#if headersSnippet}
        {@render headersSnippet()}
      {:else}
        {#each Array.from(new Array(columns)) as _column, index}
          <th style="width: {widths[index]}%;"></th>
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
