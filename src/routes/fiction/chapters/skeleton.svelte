<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
</script>

<Chapter description="A Default Skeleton">
  <Skeleton />
</Chapter>
<Chapter description="A Card Skeleton">
  <Skeleton class="h-24 w-44 rounded-sm" />
</Chapter>
<Chapter description="A Skeleton Table">
  <div class="relative mb-8 flex flex-col gap-4">
    <SkeletonTable />
  </div>
</Chapter>
