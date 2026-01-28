<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Table from '$lib/holocene/table/table.svelte';

  export const meta = {
    title: 'Table',
    component: Table,
    args: {
      columns: 3,
      rows: 3,
    },
    argTypes: {
      columns: { control: 'number' },
      rows: { control: 'number' },
    },
  } satisfies Meta<
    Omit<Table, 'columns' | 'rows'> & { columns?: number; rows?: number }
  >;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <Table class="w-full" updating={args.updating} data-testid={context.id}>
    <tr slot="headers">
      {#each Array(args.columns) as _, index (index)}
        <th>Heading {index + 1}</th>
      {/each}
    </tr>
    {#each Array(args.rows) as _, index (index)}
      <tr>
        {#each Array(args.columns) as _, colIdx (colIdx)}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </tr>
    {/each}
  </Table>
</Template>

<Story name="Primary" args={{ variant: 'primary' }} />

<Story name="Primary, Updating" args={{ updating: true, variant: 'primary' }} />
