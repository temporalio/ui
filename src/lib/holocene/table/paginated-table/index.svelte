<script lang="ts">
  import ProgressBar from '$lib/holocene/progress-bar.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';

  type Item = $$Generic;

  export let visibleItems: Item[];
  export let variant: 'primary' | 'split' = 'primary';
  export let loading = false;
  export let updating = false;
  export let maxHeight = '';
  export let fixed = false;

  let tableContainer: HTMLDivElement;

  $: tableOffset = tableContainer?.offsetTop
    ? tableContainer?.offsetTop + 32
    : 0;
</script>

<div
  class="paginated-table-wrapper {variant}"
  bind:this={tableContainer}
  style="max-height: {maxHeight || `calc(100vh - ${tableOffset}px)`}"
>
  {#if loading}
    {#if $$slots.loading}
      <slot name="loading" />
    {:else}
      <SkeletonTable rows={15} />
    {/if}
  {:else}
    <table
      class="paginated-table"
      class:table-fixed={fixed}
      class:table-auto={!fixed}
      {...$$restProps}
    >
      <slot name="caption" />
      <thead class="paginated-table-header">
        <slot name="headers" {visibleItems} />
        {#if updating}
          <ProgressBar />
        {/if}
      </thead>
      <tbody class="paginated-table-body">
        <slot />
      </tbody>
    </table>
    {#if visibleItems.length}
      <div class="paginated-table-controls">
        <slot name="actions-start" />
        <slot name="actions-center" />
        <slot name="actions-end" />
      </div>
    {:else}
      <slot name="empty" />
    {/if}
  {/if}
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .paginated-table-wrapper {
    @apply surface-primary min-h-[154px] overflow-auto;
  }

  .primary {
    @apply border-table border;
  }

  .split {
    @apply border-subtle border-t;
  }

  .paginated-table {
    @apply w-full;
  }

  .paginated-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply surface-table text-off-white h-10;
    }

    :global(tr > th) {
      @apply px-2 text-left font-medium whitespace-nowrap;
    }
  }

  .paginated-table-body {
    :global(tr.primary) {
      @apply border-table hover:bg-interactive-table-hover border-b last-of-type:border-0 hover:bg-fixed;
    }

    :global(tr.dense) {
      @apply hover:bg-interactive-table-hover h-8 hover:cursor-pointer hover:bg-fixed;
    }

    :global(tr.expanded) {
      @apply hover:bg-primary w-full;
    }

    :global(tr.dense:nth-of-type(odd)) {
      @apply surface-background hover:bg-interactive-table-hover;
    }

    :global(tr.dense.expanded) {
      @apply bg-interactive-secondary-active;
    }

    :global(tr.dense.active) {
      @apply bg-interactive-table-hover;
    }

    :global(tr > td) {
      @apply px-2 whitespace-nowrap;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }
  }

  .primary .paginated-table-body {
    :global(tr:not(.empty)) {
      @apply border-table hover:bg-interactive-table-hover h-8 border-b last-of-type:border-0 hover:bg-fixed;
    }
  }

  .split .paginated-table-body {
    @apply flex;

    :global(tr > td) {
      @apply px-0;
    }
  }

  .paginated-table-controls {
    @apply surface-primary border-table sticky bottom-0 left-0 flex w-full grow items-center justify-between gap-2 border-t px-4 py-2;
  }
</style>
