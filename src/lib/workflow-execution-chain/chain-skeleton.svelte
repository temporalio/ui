<script lang="ts">
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  const cards = [0, 1, 2, 3];
</script>

<div class="flex flex-col gap-4" data-testid="chain-skeleton">
  <div class="flex flex-col gap-2">
    <Skeleton class="h-4 w-56" />
    <div
      class="flex gap-2 overflow-hidden rounded-lg border border-primary p-2"
    >
      {#each cards as card (card)}
        <div
          class="flex min-w-[148px] flex-1 flex-col gap-2 rounded border border-secondary p-2"
        >
          <Skeleton class="h-3 w-3/4" />
          <Skeleton class="h-1.5" />
          <Skeleton class="h-3 w-1/2" />
        </div>
      {/each}
    </div>
  </div>
  <Skeleton class="h-96 rounded-lg" />
</div>
