<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
</script>

<div class="flex flex-col gap-4" data-testid="batch-operation-skeleton">
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex flex-row items-center gap-2">
        <Skeleton class="h-8 w-64 rounded-sm" />
        <Skeleton class="h-8 w-24 rounded-sm" />
      </div>
      <Skeleton class="h-4 w-80 rounded-sm" />
    </div>
  </div>

  <Card>
    <div class="flex flex-col gap-2">
      <Skeleton class="h-4 w-16 rounded-sm" />
      {#each Array.from({ length: 6 }) as _, i (i)}
        <div class="grid grid-cols-10 items-center gap-2 border-b py-2">
          <Skeleton class="col-span-2 h-4 w-24 rounded-sm" />
          <Skeleton class="col-span-8 h-4 w-40 rounded-sm" />
        </div>
      {/each}
    </div>
  </Card>

  <Card>
    <div class="flex flex-col gap-4">
      <Skeleton class="h-4 w-16 rounded-sm" />
      {#each Array.from({ length: 2 }) as _, i (i)}
        <div class="flex flex-col gap-2">
          <div class="flex justify-between">
            <Skeleton class="h-3 w-32 rounded-sm" />
            <Skeleton class="h-3 w-16 rounded-sm" />
          </div>
          <Skeleton class="h-2 w-full rounded" />
        </div>
      {/each}
    </div>
  </Card>
</div>
