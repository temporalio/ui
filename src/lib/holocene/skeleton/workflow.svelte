<script lang="ts">
  import Skeleton from './index.svelte';
</script>

<div class="flex flex-col gap-4 border-subtle">
  <Skeleton class="h-4 w-32" />
  <div class="flex justify-between gap-4">
    <div class="flex w-full items-center gap-4">
      <Skeleton class="h-8 w-24" />
      <Skeleton class="h-8 w-1/2" />
    </div>
    <Skeleton class="h-8 w-20 rounded-sm" />
  </div>
  <Skeleton class="h-32 w-full rounded-sm" />
  <div class="flex items-center gap-4 border-b border-subtle pb-2">
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
  </div>
  <div class="flex flex-col items-center gap-4 md:flex-row">
    <Skeleton class="h-16 w-full rounded-sm md:h-32" />
    <Skeleton class="h-16 w-full rounded-sm md:h-32" />
  </div>
  <Skeleton class="h-96 w-full rounded-sm" />
</div>
