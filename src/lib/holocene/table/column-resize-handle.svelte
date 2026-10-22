<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import {
    clampColumnWidth,
    handleColumnResizeKey,
  } from '$lib/utilities/column-width';

  interface Props {
    label: string;
    width: number | undefined;
    min?: number;
    onResize: (width: number | undefined) => void;
  }

  let { label, width, min = 80, onResize }: Props = $props();

  let handle = $state<HTMLDivElement>();
  let resizing = $state(false);
  let measuredWidth = $state(0);
  let measuredTableWidth = $state(0);

  let dragStartX = 0;
  let dragStartWidth = 0;
  let widthBeforeDrag: number | undefined;

  const cell = $derived(handle?.closest('th') ?? undefined);

  const resolvedWidth = $derived(width ?? Math.round(measuredWidth));

  const clamp = (value: number) => clampColumnWidth(value, min);
  const currentWidth = () => width ?? cell?.getBoundingClientRect().width ?? 0;

  $effect(() => {
    if (!cell) return;

    const table = cell.closest('table');
    const observer = new ResizeObserver(() => {
      measuredWidth = cell.getBoundingClientRect().width;
      if (table) measuredTableWidth = table.getBoundingClientRect().width;
    });

    observer.observe(cell);
    if (table) observer.observe(table);

    return () => observer.disconnect();
  });

  $effect(() => {
    if (!resizing) return;

    const cancelDrag = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      resizing = false;
      onResize(widthBeforeDrag);
    };

    window.addEventListener('keydown', cancelDrag);

    return () => window.removeEventListener('keydown', cancelDrag);
  });

  const handlePointerDown = (event: PointerEvent) => {
    if (!cell) return;
    event.preventDefault();

    dragStartX = event.clientX;
    dragStartWidth = cell.getBoundingClientRect().width;
    widthBeforeDrag = width;
    resizing = true;
    handle?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!resizing) return;
    onResize(clamp(dragStartWidth + event.clientX - dragStartX));
  };

  const handlePointerUp = () => {
    resizing = false;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleColumnResizeKey(event, currentWidth(), min, onResize);
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={handle}
  class="resize-handle"
  class:resizing
  role="separator"
  tabindex="0"
  aria-orientation="vertical"
  aria-label={translate('common.resize-column', { column: label })}
  aria-valuenow={resolvedWidth}
  aria-valuemin={min}
  aria-valuemax={measuredTableWidth || undefined}
  aria-valuetext={`${resolvedWidth}px`}
  data-testid="resize-column-handle-{label}"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
  ondblclick={() => onResize(undefined)}
  onkeydown={handleKeyDown}
></div>

<style lang="postcss">
  .resize-handle {
    @apply absolute right-0 top-0 z-10 h-full w-2 translate-x-1/2 cursor-col-resize touch-none;

    &::after {
      @apply absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-border-primary transition-[height,width,background-color] duration-150 ease-out content-[''];
    }

    &:focus-visible {
      @apply outline-none ring-2 ring-inset ring-primary;
    }

    &:hover::after,
    &:focus-visible::after,
    &.resizing::after {
      @apply h-6 w-0.5 bg-border-brand;
    }
  }

  :global(th:last-child)
    .resize-handle:not(:hover, :focus-visible, .resizing)::after {
    @apply bg-transparent;
  }
</style>
