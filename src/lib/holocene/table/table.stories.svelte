<svelte:options runes />

<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Table from '$lib/holocene/table/table.svelte';

  type TableArgs = Omit<ComponentProps<typeof Table>, 'columns' | 'rows'> & {
    columns?: number;
    rows?: number;
  };

  const { Story } = defineMeta({
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
    render: template,
  });
</script>

{#snippet template(args: TableArgs, context: StoryContext<TableArgs>)}
  <Table class="w-full" updating={args.updating} data-testid={context.id}>
    {#snippet headers()}
      <tr>
        {#each Array(args.columns) as _, index}
          <th>Heading {index + 1}</th>
        {/each}
      </tr>
    {/snippet}
    {#each Array(args.rows) as _}
      <tr>
        {#each Array(args.columns) as _, colIdx}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </tr>
    {/each}
  </Table>
{/snippet}

<Story name="Primary" args={{}} />

<Story name="Primary, Updating" args={{ updating: true }} />
