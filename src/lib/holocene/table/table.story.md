# Table

The `<Table />` component supports 2 different sets of styles, a "simple" and "primary" variant. These styles can be controlled by specifying the desired style type in the `variant` prop as one of `"simple"` or `"primary"`. `"primary"` is the default.

i.e.

```svelte
<Table variant="primary" />

<!-- or -->

<Table variant="simple" />
```

It's intended for `<Table />` and its sibling components `<TableHeaderRow />` and `<TableRow />` to be composed by the caller to achieve proper styling for "primary" tables. These components are not required for "simple" tables. Callers should supply their own table cells via native `<th />` and `<td />` elements.

An example of proper `<Table />` usage is as such:

```svelte
<Table variant="primary">
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

<!-- For more Table examples, see the Table story -->
