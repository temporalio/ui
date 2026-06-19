<script lang="ts">
  import { getContext } from 'svelte';

  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';

  const _ctx = getContext<TimelineCtx>(TIMELINE_CTX);
  const timelineState = _ctx.state;
  const setViewport = (p: Parameters<typeof _ctx.setViewport>[0]) =>
    _ctx.setViewport(p);

  interface Props {
    viewportHeight: number;
  }

  let { viewportHeight }: Props = $props();

  const THUMB_MIN_PX = 28;
  const BAR_WIDTH = 8;

  const scrollHeight = $derived(timelineState.scrollHeight);
  const scrollY = $derived(timelineState.viewport.scrollY);
  const maxScrollY = $derived(Math.max(0, scrollHeight - viewportHeight));
  const visible = $derived(scrollHeight > viewportHeight);

  const thumbHeight = $derived(
    Math.max(
      THUMB_MIN_PX,
      visible
        ? (viewportHeight / scrollHeight) * viewportHeight
        : viewportHeight,
    ),
  );

  const thumbTop = $derived(
    maxScrollY > 0
      ? (scrollY / maxScrollY) * (viewportHeight - thumbHeight)
      : 0,
  );

  let isDragging = $state(false);
  let dragStartY = 0;
  let dragStartScrollY = 0;

  function onThumbPointerDown(e: PointerEvent) {
    isDragging = true;
    dragStartY = e.clientY;
    dragStartScrollY = scrollY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  }

  function onThumbPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY;
    const scrollRatio = deltaY / (viewportHeight - thumbHeight);
    setViewport({
      scrollY: Math.max(
        0,
        Math.min(maxScrollY, dragStartScrollY + scrollRatio * maxScrollY),
      ),
    });
  }

  function onThumbPointerUp() {
    isDragging = false;
  }

  function onTrackClick(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickY = e.clientY - rect.top - thumbHeight / 2;
    const ratio = clickY / (viewportHeight - thumbHeight);
    setViewport({
      scrollY: Math.max(0, Math.min(maxScrollY, ratio * maxScrollY)),
    });
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="absolute right-0 top-0 z-20 cursor-pointer"
    style="width: {BAR_WIDTH}px; height: {viewportHeight}px;"
    onclick={onTrackClick}
  >
    <div class="absolute inset-0 rounded-sm bg-white/5"></div>

    <div
      class="absolute left-0 w-full rounded-sm transition-colors {isDragging
        ? 'bg-white/35'
        : 'bg-white/20'}"
      style="height: {thumbHeight}px; top: {thumbTop}px; cursor: {isDragging
        ? 'grabbing'
        : 'grab'};"
      onpointerdown={onThumbPointerDown}
      onpointermove={onThumbPointerMove}
      onpointerup={onThumbPointerUp}
      role="presentation"
    ></div>
  </div>
{/if}
