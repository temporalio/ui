<script lang="ts">
  import { getContext } from 'svelte';

  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';

  const _ctx = getContext<TimelineCtx>(TIMELINE_CTX);
  const timelineState = _ctx.state;

  const TRACK_H = 10;
  const MIN_THUMB_W = 24;

  let trackEl = $state<HTMLDivElement | null>(null);
  let trackWidth = $state(0);

  const data = $derived(timelineState.dataRange);
  const vp = $derived(timelineState.viewport);

  const dataSpan = $derived(Math.max(1, data.endMs - data.startMs));
  const vpSpan = $derived(Math.max(1, vp.endMs - vp.startMs));

  const thumbW = $derived(
    Math.max(MIN_THUMB_W, (vpSpan / dataSpan) * trackWidth),
  );
  const thumbX = $derived(
    Math.min(
      trackWidth - thumbW,
      ((vp.startMs - data.startMs) / dataSpan) * trackWidth,
    ),
  );

  let drag = $state<{ originX: number; originStartMs: number } | null>(null);

  function onThumbDown(e: PointerEvent) {
    e.preventDefault();
    drag = { originX: e.clientX, originStartMs: vp.startMs };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onThumbMove(e: PointerEvent) {
    if (!drag) return;
    const deltaPx = e.clientX - drag.originX;
    const deltaMs = (deltaPx / trackWidth) * dataSpan;
    const maxStart = data.endMs - vpSpan;
    timelineState.viewport.startMs = Math.max(
      data.startMs,
      Math.min(maxStart, drag.originStartMs + deltaMs),
    );
  }

  function onThumbUp() {
    drag = null;
  }

  function onTrackClick(e: MouseEvent) {
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetMs = data.startMs + (clickX / trackWidth) * dataSpan;
    const maxStart = data.endMs - vpSpan;
    timelineState.viewport.startMs = Math.max(
      data.startMs,
      Math.min(maxStart, targetMs - vpSpan / 2),
    );
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={trackEl}
  bind:clientWidth={trackWidth}
  class="bg-gray-900 relative shrink-0 cursor-pointer"
  style="height: {TRACK_H}px"
  onmousedown={onTrackClick}
>
  <div
    class="absolute top-0.5 rounded-full bg-white/20 transition-colors hover:bg-white/35 active:bg-white/45"
    style="
      left: {thumbX}px;
      width: {thumbW}px;
      height: {TRACK_H - 4}px;
      cursor: {drag ? 'grabbing' : 'grab'};
    "
    onpointerdown={onThumbDown}
    onpointermove={onThumbMove}
    onpointerup={onThumbUp}
    onpointercancel={onThumbUp}
    role="scrollbar"
    aria-controls="timeline-canvas"
    aria-valuenow={Math.round(vp.startMs)}
    aria-valuemin={data.startMs}
    aria-valuemax={data.endMs}
    aria-orientation="horizontal"
    tabindex="0"
  ></div>
</div>
