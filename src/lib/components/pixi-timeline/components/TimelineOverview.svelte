<script lang="ts">
  import { getContext } from 'svelte';

  import { getGroupMeta } from '$lib/services/grouped-event-buffer';

  import { EVENT_COLORS } from '../eventColors';
  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';
  import type { PixiRenderArgs } from '../types';

  const _ctx = getContext<TimelineCtx>(TIMELINE_CTX);
  const timelineState = _ctx.state;
  const setViewport = (p: Parameters<typeof _ctx.setViewport>[0]) =>
    _ctx.setViewport(p);

  interface Props {
    renderArgs: PixiRenderArgs;
    height: number;
  }

  let { renderArgs, height }: Props = $props();

  const WIDTH = 52;

  let canvas = $state<HTMLCanvasElement | null>(null);
  let isHovered = $state(false);
  let hoverY = $state(0);
  let _pendingY: number | null = null;
  let _rafId: number | null = null;

  function scheduleYFlush(y: number) {
    _pendingY = y;
    if (_rafId !== null) return;
    _rafId = requestAnimationFrame(() => {
      _rafId = null;
      if (_pendingY !== null) {
        hoverY = _pendingY;
        _pendingY = null;
      }
    });
  }

  const layout = $derived.by(() => {
    const poolCount = renderArgs.poolCount;
    const nTracks = timelineState.totalTracks || poolCount;
    if (nTracks === 0) return null;

    type TrackEntry = { startMs: number; endMs: number; pixiType: string };
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const trackEvent = new Map<number, TrackEntry>();
    for (let i = 0; i < poolCount; i++) {
      const meta = getGroupMeta(i);
      if (!meta) continue;
      const t = meta.trackIndex;
      if (
        !trackEvent.has(t) ||
        meta.endMs - meta.startMs >
          trackEvent.get(t)!.endMs - trackEvent.get(t)!.startMs
      ) {
        trackEvent.set(t, {
          startMs: meta.startMs,
          endMs: meta.endMs,
          pixiType: meta.pixiType,
        });
      }
    }

    const LOG_1H = Math.log1p(3_600_000);
    const weights = new Float64Array(nTracks);
    for (let t = 0; t < nTracks; t++) {
      const e = trackEvent.get(t);
      weights[t] = e
        ? Math.max(0.1, Math.log1p(e.endMs - e.startMs) / LOG_1H)
        : 0.1;
    }
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const toPx = new Float32Array(nTracks + 1);
    let cur = 0;
    for (let t = 0; t < nTracks; t++) {
      toPx[t] = cur;
      cur += weights[t] / totalWeight;
    }
    toPx[nTracks] = 1;

    return { nTracks, trackEvent, toPx, LOG_1H };
  });

  $effect(() => {
    if (!canvas || !layout || height <= 0) return;

    const { nTracks, trackEvent, toPx, LOG_1H } = layout;
    const { startMs: dataStart, endMs: dataEnd } = timelineState.dataRange;
    const totalMs = dataEnd - dataStart;
    if (totalMs <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasW = Math.round(WIDTH * dpr);
    const canvasH = Math.round(height * dpr);

    canvas.width = canvasW;
    canvas.height = canvasH;

    const ctx = canvas.getContext('2d')!;
    const rowPx = new Float32Array(nTracks + 1);
    const minPx = 2;
    let allocated = 0;
    for (let t = 0; t < nTracks; t++) {
      rowPx[t] = allocated;
      allocated += Math.max(minPx, (toPx[t + 1] - toPx[t]) * canvasH);
    }
    rowPx[nTracks] = allocated;

    const imageData = ctx.createImageData(canvasW, canvasH);
    const data = imageData.data;

    let t = 0;
    for (let py = 0; py < canvasH; py++) {
      while (t < nTracks - 1 && rowPx[t + 1] <= py) t++;

      const row = py * canvasW * 4;
      const event = trackEvent.get(t);

      if (!event) {
        for (let x = 0; x < canvasW; x++) {
          data[row + x * 4] = 8;
          data[row + x * 4 + 1] = 8;
          data[row + x * 4 + 2] = 16;
          data[row + x * 4 + 3] = 255;
        }
        continue;
      }

      const color = EVENT_COLORS[event.pixiType] ?? EVENT_COLORS.default;
      const baseR = (color >> 16) & 0xff;
      const baseG = (color >> 8) & 0xff;
      const baseB = color & 0xff;
      const bright = Math.min(
        1,
        0.3 + 0.7 * (Math.log1p(event.endMs - event.startMs) / LOG_1H),
      );
      const r = Math.min(255, Math.round(baseR * bright));
      const g = Math.min(255, Math.round(baseG * bright));
      const b = Math.min(255, Math.round(baseB * bright));

      const xStart = Math.floor(
        ((event.startMs - dataStart) / totalMs) * canvasW,
      );
      const xEnd = Math.max(
        xStart + 2,
        Math.ceil(((event.endMs - dataStart) / totalMs) * canvasW),
      );

      for (let x = 0; x < canvasW; x++) {
        const inEvent = x >= xStart && x < xEnd;
        data[row + x * 4] = inEvent ? r : 8;
        data[row + x * 4 + 1] = inEvent ? g : 8;
        data[row + x * 4 + 2] = inEvent ? b : 16;
        data[row + x * 4 + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  });

  function trackToCssY(track: number): number {
    if (!layout) return 0;
    return (layout.toPx[Math.min(track, layout.nTracks)] ?? 0) * height;
  }

  function scrollToTrack(scrollY: number): number {
    if (!layout || timelineState.scrollHeight <= 0) return 0;
    const rowSize = timelineState.scrollHeight / layout.nTracks;
    return rowSize > 0 ? Math.max(0, Math.floor(scrollY / rowSize)) : 0;
  }

  const vpTop = $derived(
    trackToCssY(scrollToTrack(timelineState.viewport.scrollY)),
  );

  const vpBottom = $derived.by(() => {
    if (!layout || timelineState.scrollHeight <= 0) return height;
    const { scrollY } = timelineState.viewport;
    const rowSize = timelineState.scrollHeight / layout.nTracks;
    const bottom = Math.min(
      layout.nTracks,
      Math.ceil((scrollY + height) / rowSize),
    );
    return trackToCssY(bottom);
  });

  const vpHeight = $derived(Math.max(8, vpBottom - vpTop));

  type HoveredEntry = {
    startMs: number;
    endMs: number;
    pixiType: string;
    trackIndex: number;
  } | null;

  const hoveredEntry = $derived.by((): HoveredEntry => {
    if (!layout || !isHovered) return null;
    const frac = hoverY / height;
    let lo = 0,
      hi = layout.nTracks;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((layout.toPx[mid + 1] ?? 1) <= frac) lo = mid + 1;
      else hi = mid;
    }
    const t = Math.min(lo, layout.nTracks - 1);
    const e = layout.trackEvent.get(t);
    return e ? { ...e, trackIndex: t } : null;
  });

  let isDragging = $state(false);
  let dragStartY = 0;
  let dragStartScroll = 0;

  function minimapYToScrollY(cssY: number): number {
    if (!layout || timelineState.scrollHeight <= 0) return 0;
    const { nTracks, toPx } = layout;
    const frac = cssY / height;
    let lo = 0,
      hi = nTracks;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((toPx[mid + 1] ?? 1) <= frac) lo = mid + 1;
      else hi = mid;
    }
    const rowSize = timelineState.scrollHeight / nTracks;
    return Math.max(
      0,
      Math.min(timelineState.scrollHeight - height, lo * rowSize),
    );
  }

  function onPointerEnter() {
    isHovered = true;
  }
  function onPointerLeave() {
    isHovered = false;
    isDragging = false;
  }

  function onPointerDown(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const target = minimapYToScrollY(e.clientY - rect.top) - height / 2;
    setViewport({ scrollY: Math.max(0, target) });

    isDragging = true;
    dragStartY = e.clientY;
    dragStartScroll = timelineState.viewport.scrollY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    scheduleYFlush(e.clientY - rect.top);

    if (!isDragging || height <= 0) return;
    const deltaScroll =
      (e.clientY - dragStartY) * (timelineState.scrollHeight / height);
    const maxScroll = Math.max(0, timelineState.scrollHeight - height);
    setViewport({
      scrollY: Math.max(0, Math.min(maxScroll, dragStartScroll + deltaScroll)),
    });
  }

  function onPointerUp() {
    isDragging = false;
  }

  function durationLabel(startMs: number, endMs: number): string {
    const ms = endMs - startMs;
    if (ms < 1_000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
    if (ms < 86_400_000) return `${(ms / 3_600_000).toFixed(1)}h`;
    return `${(ms / 86_400_000).toFixed(1)}d`;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="relative shrink-0 select-none border-l border-white/[0.07]"
  style="width:{WIDTH}px; height:{height}px; cursor:{isDragging
    ? 'grabbing'
    : 'ns-resize'}"
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
>
  <canvas bind:this={canvas} class="absolute inset-0 h-full w-full"></canvas>

  <div
    class="pointer-events-none absolute inset-x-0 top-0 bg-black/60"
    style="height:{vpTop}px"
  ></div>

  <div
    class="pointer-events-none absolute inset-x-0"
    style="top:{vpTop}px; height:{vpHeight}px; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 28%);"
  >
    <div class="absolute inset-x-0 top-0 h-[2px] bg-white/50"></div>
    <div class="absolute inset-x-0 bottom-0 h-[2px] bg-white/50"></div>
  </div>

  <div
    class="pointer-events-none absolute inset-x-0 bottom-0 bg-black/60"
    style="top:{vpTop + vpHeight}px"
  ></div>

  {#if isHovered && hoveredEntry}
    {@const color =
      '#' +
      ((EVENT_COLORS[hoveredEntry.pixiType] ?? EVENT_COLORS.default) >>> 0)
        .toString(16)
        .padStart(6, '0')}
    <div
      class="bg-gray-950/95 pointer-events-none absolute right-full top-2 z-50 mr-2 w-48 rounded-md border border-white/10 p-2 shadow-xl backdrop-blur"
    >
      <div class="flex items-center gap-1.5">
        <div
          class="h-2 w-2 shrink-0 rounded-sm"
          style="background:{color}"
        ></div>
        <span class="truncate font-mono text-[10px] font-medium text-white"
          >{hoveredEntry.pixiType
            .replace('GROUP_', '')
            .replace('EVENT_TYPE_', '')}</span
        >
      </div>
      <div class="mt-0.5 font-mono text-[9px] text-white/30">
        {durationLabel(hoveredEntry.startMs, hoveredEntry.endMs)} · row {hoveredEntry.trackIndex}
      </div>
    </div>
  {/if}
</div>
