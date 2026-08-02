<script lang="ts">
  import type { Snippet } from 'svelte';

  import { translate } from '$lib/i18n/translate';
  import {
    type ConfigurableTableHeader,
    MIN_COLUMN_WIDTH,
  } from '$lib/stores/configurable-table-columns';

  interface Props {
    column: ConfigurableTableHeader;
    onResize?: (width: number | undefined) => void;
    children?: Snippet;
  }

  let { children, column, onResize }: Props = $props();
  let { label, width } = $derived(column);

  const KEYBOARD_RESIZE_STEP = 16;

  let cell = $state<HTMLTableCellElement>();
  let resizing = $state(false);
  let measuredWidth = $state(0);

  const clamp = (value: number) =>
    Math.max(MIN_COLUMN_WIDTH, Math.round(value));
  const currentWidth = () => width ?? cell?.getBoundingClientRect().width ?? 0;

  // Live width exposed to assistive tech: use the explicit width when set,
  // otherwise the measured (auto-sized) width kept current by the observer.
  const resolvedWidth = $derived(
    width !== undefined ? width : Math.round(measuredWidth),
  );

  $effect(() => {
    if (!cell) return;

    const observer = new ResizeObserver(() => {
      if (cell) measuredWidth = cell.getBoundingClientRect().width;
    });
    observer.observe(cell);

    return () => observer.disconnect();
  });

  const handlePointerDown = (event: PointerEvent) => {
    if (!onResize || !cell) return;
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = cell.getBoundingClientRect().width;
    const startWidthValue = width;
    resizing = true;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onResize(clamp(startWidth + moveEvent.clientX - startX));
    };

    const stopResizing = () => {
      resizing = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
      window.removeEventListener('keydown', handleCancel);
    };

    // Escape aborts the drag and restores the pre-drag width
    // (including back to auto if it had no explicit width).
    const handleCancel = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== 'Escape') return;
      keyEvent.preventDefault();
      onResize(startWidthValue);
      stopResizing();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);
    window.addEventListener('keydown', handleCancel);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!onResize) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onResize(clamp(currentWidth() - KEYBOARD_RESIZE_STEP));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onResize(clamp(currentWidth() + KEYBOARD_RESIZE_STEP));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onResize(undefined);
    }
  };
</script>

<th
  bind:this={cell}
  scope="col"
  class="workflows-summary-table-header-cell"
  style={width !== undefined
    ? `width: ${width}px; min-width: ${width}px; max-width: ${width}px`
    : undefined}
  data-testid="workflows-summary-table-header-cell-{label}"
>
  <div class="flex items-center gap-2 overflow-hidden">
    <span class="truncate">{label}</span>
    {@render children?.()}
  </div>
  {#if onResize}
    <button
      type="button"
      class="resize-handle"
      class:resizing
      role="separator"
      aria-orientation="vertical"
      aria-label={translate('common.resize-column', { column: label })}
      aria-valuenow={resolvedWidth}
      aria-valuemin={MIN_COLUMN_WIDTH}
      aria-valuetext={`${resolvedWidth}px`}
      data-testid="resize-column-handle-{label}"
      onpointerdown={handlePointerDown}
      ondblclick={() => onResize(undefined)}
      onkeydown={handleKeyDown}
    ></button>
  {/if}
</th>

<style lang="postcss">
  .workflows-summary-table-header-cell {
    @apply relative;
  }

  .resize-handle {
    @apply absolute right-0 top-0 z-10 h-full w-2 translate-x-1/2 cursor-col-resize touch-none;

    &::after {
      @apply absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-transparent transition-[height,width,background-color] duration-150 ease-out content-[''];
    }

    &:focus-visible {
      @apply outline-none ring-2 ring-inset ring-primary;
    }
  }

  /* Reveal every divider while the header row is hovered, so the handles are discoverable without hunting for them */
  :global(tr:hover) .resize-handle::after {
    @apply bg-[rgb(var(--color-border-secondary))];
  }

  /* emphasize the divider being hovered, focused, or dragged - these selectors are prefixed to outrank the reveal rule above */
  :global(tr:hover) .resize-handle:hover::after,
  :global(tr) .resize-handle:focus-visible::after,
  :global(tr) .resize-handle.resizing::after {
    @apply h-6 w-0.5 bg-interactive;
  }
</style>
