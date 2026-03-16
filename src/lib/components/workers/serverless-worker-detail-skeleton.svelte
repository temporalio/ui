<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <Skeleton class="h-5 w-16 rounded-sm" />
        <Skeleton class="h-7 w-48" />
      </div>
      <div class="flex items-center gap-4">
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-4 w-28" />
      </div>
    </div>
    <Skeleton class="h-9 w-16 rounded" />
  </div>

  <div class="flex items-center gap-6 border-b border-subtle pb-4">
    {#each Array(5) as _}
      <div class="flex flex-col gap-1">
        <Skeleton class="h-3 w-20" />
        <Skeleton class="h-4 w-28" />
      </div>
    {/each}
  </div>

  <Card>
    <Skeleton class="mb-2 h-5 w-48" />
    <Skeleton class="mb-4 h-4 w-80" />
    <div class="flex flex-col gap-4">
      <Skeleton class="h-4 w-32" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-3 w-20" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-32" />
      </div>
      <div class="flex flex-col gap-1">
        <Skeleton class="h-3 w-24" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-36" />
      </div>
    </div>
    <div class="mt-6 border-t border-subtle pt-4">
      <Skeleton class="mb-4 h-4 w-40" />
      <div class="grid grid-cols-2 gap-4">
        {#each Array(4) as _}
          <div class="flex flex-col gap-1">
            <Skeleton class="h-3 w-24" />
            <Skeleton class="h-4 w-16" />
          </div>
        {/each}
      </div>
    </div>
  </Card>

  <div class="flex flex-col gap-4">
    <div class="flex gap-4 border-b border-subtle pb-2">
      <Skeleton class="h-6 w-20" />
      <Skeleton class="h-6 w-20" />
    </div>
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div class="col-span-1 xl:col-span-2">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          {#each Array(4) as _}
            <Card>
              <Skeleton class="mb-3 h-4 w-28" />
              <div class="flex flex-col gap-3">
                <Skeleton class="h-2 w-full rounded-full" />
                <div class="flex justify-between">
                  <Skeleton class="h-3 w-24" />
                  <Skeleton class="h-3 w-12" />
                </div>
                <div class="flex justify-between">
                  <Skeleton class="h-3 w-20" />
                  <Skeleton class="h-3 w-16" />
                </div>
                <div class="flex justify-between">
                  <Skeleton class="h-3 w-16" />
                  <Skeleton class="h-3 w-20" />
                </div>
              </div>
            </Card>
          {/each}
        </div>
      </div>
      <div class="col-span-1 flex flex-col gap-4">
        <Card>
          <Skeleton class="mb-3 h-4 w-20" />
          {#each Array(7) as _}
            <div class="mb-2 flex justify-between">
              <Skeleton class="h-3 w-24" />
              <Skeleton class="h-3 w-20" />
            </div>
          {/each}
        </Card>
        <Card>
          <Skeleton class="mb-3 h-4 w-28" />
          {#each Array(3) as _}
            <div class="mb-2 flex justify-between">
              <Skeleton class="h-3 w-20" />
              <Skeleton class="h-3 w-12" />
            </div>
          {/each}
        </Card>
        <Card>
          <Skeleton class="mb-3 h-4 w-24" />
          {#each Array(2) as _}
            <div class="mb-2 flex justify-between">
              <Skeleton class="h-3 w-28" />
              <Skeleton class="h-3 w-12" />
            </div>
          {/each}
        </Card>
      </div>
    </div>
  </div>
</div>
