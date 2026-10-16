# Table

It's intended for `<Table />` and its sibling components `<TableHeaderRow />` and `<TableRow />` to be composed by the caller to achieve proper styling for "primary" tables. Callers should supply their own table cells via native `<th />` and `<td />` elements.

An example of proper `<Table />` usage is as such:

```svelte
<Table>
  <TableHeaderRow slot="headers">
    <th>Email</th>
    <th>Role</th>
  </TableHeaderRow>
  <TableRow>
    <td>george@temporal.io</td>
    <td>Global Admin</td>
  </TableRow>
  <TableRow>
    <td>lucile@temporal.io</td>
    <td>Developer</td>
  </TableRow>
  <TableRow>
    <td>tobias@temporal.io</td>
    <td>Read-Only</td>
  </TableRow>
</Table.Root>
```

_Note the named slot notation `slot="headers"` on `<TableHeaderRow />` which is required to slot the table headers correctly in the table markup._

# Paginated Tables

## Paginated Table

`src/lib/holocene/table/paginated-table/index.svelte`

The `<PaginatedTable />` component wraps `<Table />` in a container element to facilitate additional styling and functionality that is necessary for Paginated Tables. For example, it exposes a `loading` slot, and default loading state, as well as a slot for page and page size controls that are typically associated with Paginated data.

## Paginated

`src/lib/holocene/table/paginated-table/paginated.svelte`

The `<Paginated />` component wraps `<PaginatedTable />`, adding pagination controls, props, and state management logic for data sets that are paginated on the client side.

## API Paginated

`src/lib/holocene/table/paginated-table/api-paginated.svelte`

The `<ApiPaginated />` component wraps `<PaginatedTable />`, adding pagination controls, props, and state management logic for data sets that are paginated on the server side.

### Sorting the current page

Pass `sortColumns` to `ApiPaginated` and render `SortableTableHeader` for each sortable header. The column key connects the header to a raw-value accessor and an optional type (`string`, `integer`, `number`, `datetime`, or `boolean`). Use `integer` for API int64 strings so large values retain their precision. Without a type, native numbers, booleans, dates, and strings are compared according to their runtime type.

```svelte
<script lang="ts">
  import ApiPaginated from './paginated-table/api-paginated.svelte';
  import SortableTableHeader from './sortable-table-header.svelte';
  import type { TableSortColumn } from '$lib/utilities/table-sort';

  type Row = { name: string; count: string };
  const sortColumns: Record<string, TableSortColumn<Row>> = {
    Name: { getValue: (row) => row.name, type: 'string' },
    Count: { getValue: (row) => row.count, type: 'integer' },
  };
  // onFetch supplies the paginated request for these rows.
</script>

<ApiPaginated
  {onFetch}
  {sortColumns}
  pageSizeSelectLabel="Per page"
  previousButtonLabel="Previous"
  nextButtonLabel="Next"
>
  {#snippet headers()}
    <tr>
      <SortableTableHeader column="Name" />
      <SortableTableHeader column="Count" />
      <th>Actions</th>
    </tr>
  {/snippet}
  {#snippet rows({ visibleItems })}
    {#each visibleItems as row}
      <tr><td>{row.name}</td><td>{row.count}</td><td></td></tr>
    {/each}
  {/snippet}
</ApiPaginated>
```

The first click sorts ascending; subsequent clicks toggle descending and ascending. Only the current API page is sorted, with the same choice applied when navigating pages. Sorting does not fetch data or mutate cached API results. Missing and invalid values stay last in both directions, and ties retain their original order. Rows, header snippets, action snippets, and `onItemsChange` all receive the same sorted items.

Bind the optional `sort` prop to parent component state to preserve the selection when a keyed refresh recreates the table. Keeping that state in memory resets the selection when the parent remounts, including on a browser reload.

An active sort shows a banner above the headers explaining that sorting applies only to the current page, with the visible and total counts when known. **Clear sort** restores the current page's API order without fetching data or changing pages.

Headers expose `aria-sort` and support Enter/Space. Put resize handles or other controls in the header's children snippet, outside its sort button. A header without a configured sort column renders as a plain header.

<!-- For more Table examples, see the Table story -->
