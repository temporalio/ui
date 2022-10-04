<script lang="ts">
  import type { Hst } from '@histoire/plugin-svelte';
  import Skeleton from './index.svelte';
  import SkeletonTable from './table.svelte';

  export let Hst: Hst;
</script>

<Hst.Story>
  <Hst.Variant title="A Default Skeleton Loader">
    <Skeleton />
  </Hst.Variant>

  <Hst.Variant title="A Card Skeleton Loader">
    <Skeleton class="h-24 w-44 rounded-sm" />
  </Hst.Variant>

  <Hst.Variant title="A Table Skeleton Loader">
    <SkeletonTable />
  </Hst.Variant>
</Hst.Story>
