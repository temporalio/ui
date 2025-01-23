<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  const { Story } = defineMeta({
    title: 'Table',
    component: Table,
    args: {
      variant: 'simple',
      // @ts-expect-error allows for dynamic number of columns and rows
      columns: 3,
      rows: 3,
    },
    argTypes: {
      variant: { control: 'radio', options: ['fancy', 'simple'] },
      // @ts-expect-error allows for dynamic number of columns and rows
      columns: { control: 'number' },
      rows: { control: 'number' },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(
  args: Args<typeof Story> & { columns?: number; rows?: number },
  context: StoryContext<typeof Story>,
)}
  <Table
    class="w-full"
    variant={args.variant}
    updating={args.updating}
    data-testid={context.id}
  >
    {#snippet headers()}
      <TableHeaderRow>
        {#each Array(args.columns) as _, index}
          <th>Heading {index + 1}</th>
        {/each}
      </TableHeaderRow>
    {/snippet}
    {#each Array(args.rows) as _}
      <TableRow>
        {#each Array(args.columns) as _, colIdx}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </TableRow>
    {/each}
  </Table>
{/snippet}

<Story name="Simple" />

<Story name="Fancy" args={{ variant: 'fancy' }} />

<Story name="Simple, Updating" args={{ updating: true }} />

<Story name="Fancy, Updating" args={{ updating: true, variant: 'fancy' }} />
