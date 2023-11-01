<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import SkeletonTable from './table.svelte';
</script>

<Meta title="Skeleton Table" component={SkeletonTable} />

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

<Story name="skeleton table" args={{ rows: 10, columns: 4 }} />
