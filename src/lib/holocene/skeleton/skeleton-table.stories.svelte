<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import SkeletonTable from './table.svelte';

  const { Story } = defineMeta({
    title: 'Skeleton Table',
    component: SkeletonTable,
    args: {
      rows: 10,
      columns: 4,
    },
    argTypes: {
      rows: { name: 'Rows', control: 'number' },
      columns: { name: 'Columns', control: 'number' },
    },
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof SkeletonTable> & { columns: number },
)}
  {@const columnWidths = Array.from(new Array(args.columns)).fill(
    100 / args.columns,
  )}
  <SkeletonTable {columnWidths} {...args}>
    {#snippet headers()}
      {#each Array(args.columns) as _, index}
        <th>Heading {index + 1}</th>
      {/each}
    {/snippet}
  </SkeletonTable>
{/snippet}

<Story name="Default" args={{ rows: 10, columns: 4 }} />
