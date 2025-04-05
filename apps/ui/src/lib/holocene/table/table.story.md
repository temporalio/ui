# Table

The `<Table />` component supports 2 different sets of styles, a "simple" and "fancy" variant. These styles can be controlled by specifying the desired style type in the `variant` prop as one of `"simple"` or `"fancy"`.

i.e.

```svelte
<Table variant="fancy" />

<!-- or -->

<Table variant="simple" />
```

Its intended for `<Table />` and its sibling components `<TableHeaderRow />` and `<TableRow />` to be composed by the caller to achieve proper styling for "fancy" tables. These components are not required for "simple" tables. Callers should supply their own table cells via native `<th />` and `<td />` elements.

An example of proper `<Table />` usage is as such:

```svelte
<Table variant="fancy">
  <TableHeaderRow slot="headers">
    <th>Email</th>
    <th>Role</th>
  </TableHeaderRow>
  <svelte:fragment>
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
  </svelte:fragment>
</Table>
```

_Note the named slot notation `slot="headers"` on `<TableHeaderRow />` which is required to slot the table headers correctly in the table markup. A `<svelte:fragment />` encapsulating the `<TableRow />` components is not strictly necessary, but it approximates native table markup which may aid in readability_

<!-- For more Table examples, see the Table story -->
