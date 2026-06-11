<svelte:options runes />

<script lang="ts">
  import Skeleton from './index.svelte';
</script>

<div class="border-subtle flex flex-col gap-4">
  <Skeleton class="h-4 w-32" />
  <div class="flex justify-between gap-4">
    <div class="flex w-full items-center gap-4">
      <Skeleton class="h-8 w-24" />
      <Skeleton class="h-8 w-1/2" />
    </div>
    <Skeleton class="h-8 w-20 rounded-xs" />
  </div>
  <Skeleton class="h-32 w-full rounded-xs" />
  <div class="border-subtle flex items-center gap-4 border-b pb-2">
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
    <Skeleton class="h-4 w-16" />
  </div>
  <div class="flex flex-col items-center gap-4 md:flex-row">
    <Skeleton class="h-16 w-full rounded-xs md:h-32" />
    <Skeleton class="h-16 w-full rounded-xs md:h-32" />
  </div>
  <Skeleton class="h-96 w-full rounded-xs" />
</div>
