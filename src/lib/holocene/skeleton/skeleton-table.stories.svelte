<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

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
  } satisfies Meta<SkeletonTable>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  {@const columnWidths = Array.from(new Array(args.columns)).fill(
    100 / args.columns,
  )}
  <SkeletonTable {columnWidths} {...args}>
    <svelte:fragment slot="headers">
      {#each Array(args.columns) as _, index}
        <th>Heading {index + 1}</th>
      {/each}
    </svelte:fragment>
  </SkeletonTable>
</Template>

<Story name="Light" args={{ rows: 10, columns: 4 }} />

<Story
  name="Dark"
  args={{ rows: 10, columns: 4 }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>
