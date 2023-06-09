<script lang="ts">
  import { batchActionsVisible } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import { pinnedColumnsWidth } from '$lib/stores/workflow-table-columns';

  export let noPinnedColumns: boolean = false;

  let pinnedWrapperElement: HTMLDivElement;
  let pinnedWrapperWidth = $pinnedColumnsWidth;
  let resizing = false;

  const handleMouseDown = () => {
    resizing = true;
    return false;
  };

  const handleMouseUp = () => {
    resizing = false;
    $pinnedColumnsWidth = pinnedWrapperWidth;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!resizing) return false;
    const rect = pinnedWrapperElement.getBoundingClientRect();
    pinnedWrapperWidth = event.x - rect.x;
    return false;
  };
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div
  class="workflows-summary-table-wrapper pinned"
  class:batch-actions-enabled={$supportsBulkActions}
  class:batch-actions-visible={$batchActionsVisible}
  class:no-columns-pinned={noPinnedColumns}
  bind:this={pinnedWrapperElement}
  style="width:{pinnedWrapperWidth ? pinnedWrapperWidth + 'px' : '50%'};"
>
  <slot />
</div>

<div
  class="resizer"
  data-testid="workflows-summary-table-resize-handle"
  class:batch-actions-enabled={$supportsBulkActions}
  class:batch-actions-visible={$batchActionsVisible}
  class:no-columns-pinned={noPinnedColumns}
  on:mousedown={handleMouseDown}
/>

<div
  class="workflows-summary-table-wrapper"
  data-testid="unpinned-table-columns-wrapper"
>
  <slot name="unpinned-columns" />
</div>

<style lang="postcss">
  .workflows-summary-table-wrapper {
    @apply overflow-y-visible;

    &.pinned {
      @apply shrink-0 overflow-x-hidden rounded-l-lg max-md:max-w-[50%] max-md:overflow-x-scroll max-w-fit min-w-[40px];

      &.batch-actions-visible {
        @apply !w-full;
      }

      &.batch-actions-enabled {
        @apply w-auto;
      }

      &.no-columns-pinned {
        &.batch-actions-enabled {
          @apply !w-10 overflow-visible;
        }

        &:not(.batch-actions-enabled) {
          @apply !w-0 !min-w-0;
        }

        &.batch-actions-visible {
          @apply !w-10 z-50;
        }
      }
    }

    &:not(.pinned) {
      @apply overflow-x-scroll overscroll-x-contain flex-grow rounded-r-lg;
    }
  }

  .resizer {
    box-shadow: 2px 0 4px rgb(0 0 0 / 25%);

    @apply z-10 bg-primary w-0 border-r-[3px] border-primary cursor-col-resize;

    &.no-columns-pinned {
      @apply pointer-events-none;

      &:not(.batch-actions-enabled) {
        @apply hidden;
      }
    }

    &.batch-actions-visible {
      @apply pointer-events-none;
    }
  }
</style>
