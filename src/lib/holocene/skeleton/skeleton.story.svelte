<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import Skeleton from './index.svelte';
  import SkeletonTable from './table.svelte';

  let rows: number = 10;
  let columns: number = 4;
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
    <SkeletonTable bind:rows bind:columns columnWidths={[10, 25, 50, 15]} />
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Number bind:value={rows} title="Rows: " />
    <Hst.Number bind:value={columns} title="Columns: " />
  </svelte:fragment>
</Hst.Story>
