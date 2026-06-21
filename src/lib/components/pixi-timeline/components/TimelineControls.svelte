<script lang="ts">
  import { getContext } from 'svelte';

  import {
    autoScaleUnit,
    pickTickInterval,
    type TimeScale,
  } from '../renderer/fonts';
  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';

  const _ctx = getContext<TimelineCtx>(TIMELINE_CTX);
  const timelineState = _ctx.state;
  const setViewport = (p: Parameters<typeof _ctx.setViewport>[0]) =>
    _ctx.setViewport(p);

  const SCALE_OPTIONS: TimeScale[] = ['auto', 'ms', 's', 'm', 'h', 'd', 'w'];

  const effectiveUnit = $derived(
    autoScaleUnit(pickTickInterval(timelineState.viewport.zoom)),
  );

  function zoom(factor: number) {
    const { viewport } = timelineState;
    const newZoom = Math.max(0.00005, Math.min(20, viewport.zoom * factor));
    if (newZoom === viewport.zoom) return;

    const center = (viewport.startMs + viewport.endMs) / 2;
    const oldSpan = viewport.endMs - viewport.startMs;
    const newSpan = oldSpan * (viewport.zoom / newZoom);

    setViewport({
      zoom: newZoom,
      startMs: center - newSpan / 2,
      endMs: center + newSpan / 2,
    });
  }

  function fitAll() {
    const { dataRange } = timelineState;
    const span = dataRange.endMs - dataRange.startMs;
    if (span <= 0) return;

    const padding = span * 0.04;
    const visibleSpan = span + padding * 2;
    const canvasWidth =
      document.querySelector('canvas')?.clientWidth ||
      document.documentElement.clientWidth;

    setViewport({
      startMs: dataRange.startMs - padding,
      zoom: canvasWidth / visibleSpan,
      scrollY: 0,
      scaleY: timelineState.viewport.scaleY,
    });
  }

  function formatRange(startMs: number, endMs: number): string {
    const spanMs = endMs - startMs;
    const fmt = (ms: number) => {
      if (Math.abs(ms) < 1000) return `${ms.toFixed(0)}ms`;
      if (Math.abs(ms) < 60_000) return `${(ms / 1000).toFixed(1)}s`;
      return `${(ms / 60_000).toFixed(1)}m`;
    };
    return `${fmt(spanMs)} window`;
  }
</script>

<header
  class="bg-gray-950 flex h-10 shrink-0 items-center gap-2 border-b border-white/10 px-3"
>
  <div class="flex items-center">
    <button
      onclick={() => zoom(1 / 1.5)}
      class="flex h-7 w-7 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      title="Zoom out (scroll down)"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle
          cx="6"
          cy="6"
          r="4.5"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <path
          d="M4 6h4M9.5 9.5l2.5 2.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <button
      onclick={() => zoom(1.5)}
      class="flex h-7 w-7 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      title="Zoom in (scroll up)"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle
          cx="6"
          cy="6"
          r="4.5"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <path
          d="M4 6h4M6 4v4M9.5 9.5l2.5 2.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>

  <div class="h-4 w-px bg-white/10"></div>

  <button
    onclick={fitAll}
    class="rounded px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
  >
    Fit all
  </button>

  <div class="h-4 w-px bg-white/10"></div>

  <div class="flex items-center gap-0.5">
    {#each SCALE_OPTIONS as opt}
      {@const active = timelineState.timeScale === opt}
      <button
        onclick={() => (timelineState.timeScale = opt)}
        class="rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors {active
          ? 'bg-sky-500/20 text-sky-300 ring-sky-500/40 ring-1'
          : 'text-white/30 hover:bg-white/10 hover:text-white/70'}"
      >
        {opt === 'auto' ? `auto (${effectiveUnit})` : opt}
      </button>
    {/each}
  </div>

  <div class="h-4 w-px bg-white/10"></div>

  <button
    onclick={() =>
      (timelineState.sortOrder =
        timelineState.sortOrder === 'desc' ? 'asc' : 'desc')}
    class="flex items-center gap-1 rounded px-2 py-1 font-mono text-xs transition-colors {timelineState.sortOrder ===
    'asc'
      ? 'bg-sky-500/20 text-sky-300 ring-sky-500/40 ring-1'
      : 'text-white/30 hover:bg-white/10 hover:text-white/70'}"
    title="Toggle sort order (newest-first / oldest-first)"
  >
    {#if timelineState.sortOrder === 'desc'}
      ↓ newest first
    {:else}
      ↑ oldest first
    {/if}
  </button>

  <div class="h-4 w-px bg-white/10"></div>

  <span class="text-xs text-white/25">
    {formatRange(timelineState.viewport.startMs, timelineState.viewport.endMs)}
  </span>

  <div class="ml-auto flex items-center gap-3 text-xs text-white/25">
    <span>
      {timelineState.visibleEvents.toLocaleString()}
      <span class="text-white/15">/</span>
      {timelineState.totalEvents.toLocaleString()} groups
    </span>
    {#if timelineState.rendererInfo}
      <span
        class="rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
        class:bg-violet-900={timelineState.rendererInfo === 'WebGPU'}
        class:text-violet-300={timelineState.rendererInfo === 'WebGPU'}
        class:bg-blue-900={timelineState.rendererInfo === 'WebGL'}
        class:text-blue-300={timelineState.rendererInfo === 'WebGL'}
      >
        {timelineState.rendererInfo}
      </span>
    {/if}
  </div>
</header>
