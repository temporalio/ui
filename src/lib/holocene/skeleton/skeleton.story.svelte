<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import Skeleton from './index.svelte';
  import SkeletonTable from './table.svelte';

  let rows: number = 10;
  let columns: number = 4;
  let columnWidths: number[] = [25, 25, 25, 25];

  $: {
    columnWidths = Array.from(new Array(columns)).fill(100 / columns);
  }
  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="A Default Skeleton Loader">
    <Skeleton class="h-4" />
  </Hst.Variant>

  <Hst.Variant title="A Card Skeleton Loader">
    <Skeleton class="h-24 w-44 rounded-sm" />
  </Hst.Variant>

  <Hst.Variant title="A Table Skeleton Loader">
    <SkeletonTable bind:rows bind:columns bind:columnWidths />
  </Hst.Variant>

  <Hst.Variant title="A Table Skeleton Loader with column widths">
    <SkeletonTable columns={4}>
      <svelte:fragment slot="headers">
        <th class="w-1/4">Header 1</th>
        <th class="w-1/2">Header 2</th>
        <th>Header 3</th>
        <th class="w-1/12">Header 4</th>
      </svelte:fragment>
    </SkeletonTable>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Number bind:value={rows} title="Rows: " />
    <Hst.Number bind:value={columns} title="Columns: " />
  </svelte:fragment>
</Hst.Story>
