# Holocene

Temporal's UI Component Library

## Components

### Table

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

<!-- For more Table examples, see the Table chapter in fiction -->

### Icon
The Icon component allows for rendering of SVG Icons in our app. It is designed to support SVG's with 24x24 viewboxes only! To add a new icon, follow these steps:

1. Obtain the SVG markup from a designer. Make sure it is 24x24px!
2. Create a new Svelte component in `src/lib/holocene/icon/svg` with the following contents. _Note: It's important to spread `$$props` here!_
```
<script lang="ts">
  import Svg from './svg.svelte';
</script>

<Svg {...$$props}></Svg>
```
3. Take the `<path />` element(s) from your SVG markup, and paste them in the default slot of the `<Svg />` Component.
4. Add your new icon to the `icons` object in `src/lib/holocene/icon/paths.ts`.