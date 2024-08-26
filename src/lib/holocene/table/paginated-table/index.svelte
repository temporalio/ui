<script lang="ts">
  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  type Item = $$Generic;

  export let visibleItems: Item[];
  export let updating = false;

  let tableContainer: HTMLDivElement;

  $: tableOffset = tableContainer?.offsetTop
    ? tableContainer?.offsetTop + 32
    : 0;
</script>

<div
  class="paginated-table-wrapper"
  bind:this={tableContainer}
  style="max-height: calc(100vh - {tableOffset}px)"
>
  <table class="paginated-table">
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
</div>

<style lang="postcss">
  .paginated-table-wrapper {
    @apply surface-primary max-h-none min-h-[154px] overflow-auto rounded-lg border-2 border-table;
  }

  .paginated-table {
    @apply w-full table-auto;
  }

  .paginated-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply surface-table h-10 text-off-white;
    }

    :global(tr > th) {
      @apply px-2 text-left first-of-type:rounded-tl last-of-type:rounded-tr;
    }
  }

  .paginated-table-body {
    :global(tr:not(.empty)) {
      @apply h-12 border-b border-table last-of-type:border-0 hover:bg-interactive-table-hover hover:bg-fixed;
    }

    :global(tr > td) {
      @apply px-2;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }
  }

  .paginated-table-controls {
    @apply surface-primary sticky bottom-0 left-0 flex w-full grow justify-between gap-2 rounded-b border-t border-table px-4 py-2;
  }
</style>
