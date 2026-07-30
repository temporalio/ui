<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';
  import type { ComponentProps } from 'svelte';

  import SkeletonTable from './table.svelte';

  export const meta = {
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
  } satisfies Meta<ComponentProps<typeof SkeletonTable>>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
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
</Template>

<Story name="Default" args={{ rows: 10, columns: 4 }} />
