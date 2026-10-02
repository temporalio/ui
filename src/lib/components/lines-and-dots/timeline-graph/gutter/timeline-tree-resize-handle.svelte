<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { handleColumnResizeKey } from '$lib/utilities/column-width';

  type Props = {
    /** The width the panel is drawn at. */
    width: number;
    min: number;
    max: number;
    /** Unset, the handle runs the full height of what it sits in. */
    heightPx?: number;
    /** `undefined` resets the panel to its default width. */
    onResize: (width: number | undefined) => void;
    label?: string;
    /**
     * Which side of its panel the handle is on. A panel on the left grows as
     * the handle is dragged right; one on the right grows as it's dragged
     * left.
     */
    edge?: 'end' | 'start';
  };

  const {
    width,
    min,
    max,
    heightPx,
    onResize,
    label = translate('workflows.timeline-resize-tree'),
    edge = 'end',
  }: Props = $props();

  const direction = $derived(edge === 'end' ? 1 : -1);

  let handle = $state<HTMLDivElement>();
  let resizing = $state(false);

  let dragStartX = 0;
  let dragStartWidth = 0;
  let widthBeforeDrag: number | undefined;
  let pendingWidth: number | undefined;
  let frame: ReturnType<typeof requestAnimationFrame> | undefined;

  const clamp = (value: number) =>
    Math.round(Math.min(max, Math.max(min, value)));

  const resize = (next: number | undefined) =>
    onResize(next === undefined ? undefined : clamp(next));

  // Every width change re-lays the plot, so a drag applies at most one per
  // frame however fast the pointer reports.
  const scheduleResize = (next: number) => {
    pendingWidth = next;
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (pendingWidth !== undefined) resize(pendingWidth);
    });
  };

  const cancelFrame = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    pendingWidth = undefined;
  };

  $effect(() => {
    if (!resizing) return;

    const cancelDrag = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      cancelFrame();
      resizing = false;
      onResize(widthBeforeDrag);
    };

    // Held on the page too, so the cursor and selection don't flicker when
    // the pointer outruns the handle.
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('keydown', cancelDrag);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('keydown', cancelDrag);
    };
  });

  $effect(() => cancelFrame);

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStartX = event.clientX;
    dragStartWidth = width;
    widthBeforeDrag = width;
    resizing = true;
    handle?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!resizing) return;
    scheduleResize(dragStartWidth + direction * (event.clientX - dragStartX));
  };

  const handlePointerUp = () => {
    if (!resizing) return;
    if (pendingWidth !== undefined) resize(pendingWidth);
    cancelFrame();
    resizing = false;
  };

  const MIRRORED_KEYS: Record<string, string> = {
    ArrowLeft: 'ArrowRight',
    ArrowRight: 'ArrowLeft',
  };

  // Arrow keys move the handle the way they point, so a panel whose handle
  // is on its left edge grows with the left arrow.
  const handleKeyDown = (event: KeyboardEvent) => {
    const key =
      direction === 1 ? event.key : (MIRRORED_KEYS[event.key] ?? event.key);
    handleColumnResizeKey(
      {
        key,
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation(),
      },
      width,
      min,
      resize,
    );
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={handle}
  class="tree-resize-handle"
  class:resizing
  style:height={heightPx === undefined ? '100%' : `${heightPx}px`}
  role="separator"
  tabindex="0"
  aria-orientation="vertical"
  aria-label={label}
  aria-valuenow={width}
  aria-valuemin={min}
  aria-valuemax={Number.isFinite(max) ? max : undefined}
  aria-valuetext="{width}px"
  data-testid="timeline-tree-resize-handle"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
  ondblclick={() => onResize(undefined)}
  onkeydown={handleKeyDown}
></div>

<style lang="postcss">
  .tree-resize-handle {
    @apply absolute left-0 top-0 z-50 w-2 -translate-x-1/2 cursor-col-resize touch-none;

    &::after {
      @apply absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-secondary transition-[width,background-color] duration-150 ease-out content-[''] motion-reduce:transition-none;
    }

    &:focus-visible {
      @apply outline-none;
    }

    &:hover::after,
    &:focus-visible::after,
    &.resizing::after {
      @apply w-0.5 bg-border-brand;
    }
  }
</style>
