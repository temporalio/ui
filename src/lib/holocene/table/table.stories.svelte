<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
</script>

<Meta
  title="Table"
  component={Table}
  argTypes={{
    variant: { control: 'radio', options: ['fancy', 'simple'] },
    columns: { control: 'number' },
    rows: { control: 'number' },
  }}
/>

<Story name="table" args={{ variant: 'fancy', rows: 5, columns: 3 }} let:args>
  <Table class="w-full" {...args}>
    <TableHeaderRow slot="headers">
      {#each Array(args.columns) as _, index}
        <th>Heading {index + 1}</th>
      {/each}
    </TableHeaderRow>
    {#each Array(args.rows) as _}
      <TableRow>
        {#each Array(args.columns) as _, colIdx}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </TableRow>
    {/each}
  </Table>
</Story>
