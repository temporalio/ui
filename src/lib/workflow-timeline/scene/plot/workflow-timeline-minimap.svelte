<script lang="ts">
  import type { TimeRange } from './time-viewport';
  import {
    boundTimeRange as boundRange,
    getWheelTimeRange,
  } from './wheel-time-range';

  let {
    domain,
    viewport,
    eventTimes,
    minDurationMs,
    pinnedLive,
    onselect,
  }: {
    domain: TimeRange | null;
    viewport: TimeRange | null;
    eventTimes: readonly number[];
    minDurationMs: number;
    pinnedLive: boolean;
    onselect: (range: TimeRange) => void;
  } = $props();

  const BIN_COUNT = 96;
  const RESIZE_HIT_PX = 12;
  const clamp = (value: number, minimum: number, maximum: number): number =>
    Math.max(minimum, Math.min(maximum, value));

  let track: HTMLDivElement;
  let drag = $state<{
    pointerId: number;
    mode: 'select' | 'pan' | 'resize-start' | 'resize-end';
    anchorMs: number;
    startClientX: number;
    initial: TimeRange | null;
  } | null>(null);
  let preview = $state<TimeRange | null>(null);

  const validDomain = $derived(
    domain &&
      Number.isFinite(domain.startMs) &&
      Number.isFinite(domain.endMs) &&
      domain.endMs - domain.startMs >= 1
      ? domain
      : null,
  );
  const selection = $derived.by(() => {
    const range = drag ? preview : viewport;
    return validDomain && range ? boundRange(range, validDomain) : null;
  });
  const leftPercent = $derived(
    validDomain && selection
      ? ((selection.startMs - validDomain.startMs) /
          (validDomain.endMs - validDomain.startMs)) *
          100
      : 0,
  );
  const rightPercent = $derived(
    validDomain && selection
      ? ((validDomain.endMs - selection.endMs) /
          (validDomain.endMs - validDomain.startMs)) *
          100
      : 0,
  );
  const density = $derived.by(() => {
    const bins = Array<number>(BIN_COUNT).fill(0);
    if (!validDomain) return bins;
    const span = validDomain.endMs - validDomain.startMs;
    for (const time of eventTimes) {
      if (
        !Number.isFinite(time) ||
        time < validDomain.startMs ||
        time > validDomain.endMs
      )
        continue;
      const index = Math.min(
        BIN_COUNT - 1,
        Math.floor(((time - validDomain.startMs) / span) * BIN_COUNT),
      );
      bins[index] += 1;
    }
    const maximum = Math.max(1, ...bins);
    return bins.map((count) => (count ? Math.sqrt(count / maximum) * 100 : 0));
  });

  function pointerTime(clientX: number, bounds: TimeRange): number {
    const rect = track.getBoundingClientRect();
    const fraction = clamp(
      (clientX - rect.left) / Math.max(1, rect.width),
      0,
      1,
    );
    return bounds.startMs + fraction * (bounds.endMs - bounds.startMs);
  }

  function updateSelection(clientX: number): void {
    if (!drag || !validDomain || Math.abs(clientX - drag.startClientX) < 3)
      return;
    const time = pointerTime(clientX, validDomain);
    let range: TimeRange;
    if (drag.mode === 'pan' && drag.initial) {
      const offset = time - drag.anchorMs;
      range = boundRange(
        {
          startMs: drag.initial.startMs + offset,
          endMs: drag.initial.endMs + offset,
        },
        validDomain,
      );
    } else if (drag.mode === 'resize-start' && drag.initial) {
      range = {
        startMs: clamp(time, validDomain.startMs, drag.initial.endMs - 1),
        endMs: drag.initial.endMs,
      };
    } else if (drag.mode === 'resize-end' && drag.initial) {
      range = {
        startMs: drag.initial.startMs,
        endMs: clamp(time, drag.initial.startMs + 1, validDomain.endMs),
      };
    } else {
      const startMs = Math.min(drag.anchorMs, time);
      const endMs = Math.max(drag.anchorMs, time);
      range = boundRange(
        { startMs, endMs: Math.max(startMs + 1, endMs) },
        validDomain,
      );
    }
    preview = range;
    onselect(range);
  }

  function getDragMode(
    initial: TimeRange | null,
    bounds: TimeRange,
    clientX: number,
    anchorMs: number,
  ): 'select' | 'pan' | 'resize-start' | 'resize-end' {
    if (!initial || anchorMs < initial.startMs || anchorMs > initial.endMs) {
      return 'select';
    }

    const rect = track.getBoundingClientRect();
    const span = bounds.endMs - bounds.startMs;
    const left =
      rect.left + ((initial.startMs - bounds.startMs) / span) * rect.width;
    const right =
      rect.left + ((initial.endMs - bounds.startMs) / span) * rect.width;
    const distanceFromStart = Math.abs(clientX - left);
    const distanceFromEnd = Math.abs(clientX - right);

    if (
      distanceFromStart <= RESIZE_HIT_PX &&
      distanceFromStart <= distanceFromEnd
    ) {
      return 'resize-start';
    }
    if (distanceFromEnd <= RESIZE_HIT_PX) return 'resize-end';
    return right - left >= rect.width - 2 * RESIZE_HIT_PX ? 'select' : 'pan';
  }

  function startDrag(event: PointerEvent): void {
    if (!validDomain || !event.isPrimary || event.button !== 0) return;
    const anchorMs = pointerTime(event.clientX, validDomain);
    const initial = selection;
    const mode = getDragMode(initial, validDomain, event.clientX, anchorMs);
    drag = {
      pointerId: event.pointerId,
      mode,
      anchorMs,
      startClientX: event.clientX,
      initial,
    };
    preview = initial;
    track.setPointerCapture(event.pointerId);
    if (mode === 'select') updateSelection(event.clientX);
  }

  function moveDrag(event: PointerEvent): void {
    if (event.pointerId === drag?.pointerId) updateSelection(event.clientX);
  }

  function endDrag(event: PointerEvent): void {
    if (event.pointerId !== drag?.pointerId) return;
    if (event.type === 'pointerup') updateSelection(event.clientX);
    drag = null;
    preview = null;
    if (track.hasPointerCapture(event.pointerId))
      track.releasePointerCapture(event.pointerId);
  }

  function handleWheel(event: WheelEvent): void {
    if (!validDomain || !selection || drag || (!event.deltaX && !event.deltaY))
      return;
    event.preventDefault();
    const range = getWheelTimeRange({
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      trackWidth: track.clientWidth,
      selection,
      domain: validDomain,
      minDurationMs,
      pinnedLive,
    });
    if (range) onselect(range);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!validDomain || !selection) return;
    const duration = selection.endMs - selection.startMs;
    const step = Math.max(1, duration / 10);
    let offset = 0;
    if (event.key === 'ArrowLeft') offset = -step;
    else if (event.key === 'ArrowRight') offset = step;
    else if (event.key === 'Home')
      offset = validDomain.startMs - selection.startMs;
    else if (event.key === 'End') offset = validDomain.endMs - selection.endMs;
    else return;
    event.preventDefault();
    onselect(
      boundRange(
        {
          startMs: selection.startMs + offset,
          endMs: selection.endMs + offset,
        },
        validDomain,
      ),
    );
  }
</script>

<div
  class="minimap"
  role="slider"
  aria-label="Workflow timeline viewport. Scroll vertically to zoom or horizontally to pan; drag a window edge to resize, drag inside to pan, or drag outside to select; arrow keys pan."
  aria-valuemin={validDomain?.startMs ?? 0}
  aria-valuemax={validDomain && selection
    ? validDomain.endMs - (selection.endMs - selection.startMs)
    : 0}
  aria-valuenow={selection?.startMs ?? 0}
  aria-valuetext={selection
    ? `${new Date(selection.startMs).toISOString()} to ${new Date(selection.endMs).toISOString()}`
    : 'No timeline available'}
  tabindex={validDomain && selection ? 0 : -1}
  onkeydown={onKeydown}
>
  <div
    class="track"
    role="presentation"
    class:disabled={!validDomain}
    bind:this={track}
    onwheel={handleWheel}
    onpointerdown={startDrag}
    onpointermove={moveDrag}
    onpointerup={endDrag}
    onpointercancel={endDrag}
    onlostpointercapture={endDrag}
  >
    <div class="activity" aria-hidden="true">
      {#each density as height, index (index)}
        <span class="bar" style:height={`${height}%`}></span>
      {/each}
    </div>
    {#if selection}
      <div class="shade left" style:width={`${leftPercent}%`}></div>
      <div class="shade right" style:width={`${rightPercent}%`}></div>
      <div
        class="window"
        class:nearly-full={validDomain &&
          selection.endMs - selection.startMs >=
            (validDomain.endMs - validDomain.startMs) * 0.95}
        style:left={`${leftPercent}%`}
        style:right={`${rightPercent}%`}
      >
        <span class="resize-handle start" aria-hidden="true"></span>
        <span class="resize-handle end" aria-hidden="true"></span>
      </div>
    {/if}
  </div>
</div>

<style>
  .minimap {
    box-sizing: border-box;
    flex: none;
    width: 100%;
    min-width: 0;
    padding: 0.5rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    background: var(--color-surface-primary);
  }

  .minimap:focus-visible {
    outline: 2px solid var(--color-action-workflow-workflow);
    outline-offset: -2px;
  }

  .track {
    position: relative;
    height: 2.5rem;
    overflow: hidden;
    border-radius: 0.25rem;
    background: var(--color-surface-secondary);
    cursor: crosshair;
    touch-action: none;
  }

  .track.disabled {
    cursor: default;
  }

  .activity {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    pointer-events: none;
  }

  .bar {
    flex: 1 1 0;
    min-width: 0;
    background: var(--color-action-workflow-workflow);
    opacity: 0.8;
  }

  .shade {
    position: absolute;
    top: 0;
    bottom: 0;
    background: color-mix(
      in srgb,
      var(--color-surface-primary) 68%,
      transparent
    );
    pointer-events: none;
  }

  .shade.left {
    left: 0;
  }

  .shade.right {
    right: 0;
  }

  .window {
    position: absolute;
    top: 0;
    bottom: 0;
    box-sizing: border-box;
    min-width: 1px;
    border: 2px solid var(--color-action-workflow-workflow);
    background: color-mix(
      in srgb,
      var(--color-action-workflow-workflow) 8%,
      transparent
    );
    cursor: grab;
  }

  .window.nearly-full {
    cursor: crosshair;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12px;
    cursor: ew-resize;
  }

  .resize-handle::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 14px;
    border-radius: 1px;
    background: var(--color-action-workflow-workflow);
    transform: translate(-50%, -50%);
    content: '';
  }

  .resize-handle.start {
    left: 0;
  }

  .resize-handle.end {
    right: 0;
  }

  @media (width <= 480px) {
    .minimap {
      padding: 0.375rem;
    }

    .track {
      height: 2rem;
    }
  }
</style>
