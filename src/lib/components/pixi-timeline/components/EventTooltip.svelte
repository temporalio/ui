<script lang="ts">
  import { EVENT_COLORS } from '../eventColors';
  import { getEventDisplayName } from '../eventUtils';
  import { getEventIconSvg } from '../renderer/icon-svgs';
  import type { TemporalEvent } from '../types';

  interface Props {
    event: TemporalEvent;
    x: number;
    barTop: number;
    barBottom: number;
    containerHeight: number;
  }

  let { event, x, barTop, barBottom, containerHeight }: Props = $props();

  const TOOLTIP_W = 260;
  const TOOLTIP_H = 120;
  const OFFSET = 12;

  const left = $derived(
    x + OFFSET + TOOLTIP_W > window.innerWidth
      ? x - TOOLTIP_W - OFFSET
      : x + OFFSET,
  );

  const top = $derived.by(() => {
    const mid = (barTop + barBottom) / 2;
    const ideal = mid - TOOLTIP_H / 2;
    return Math.max(0, Math.min(containerHeight - TOOLTIP_H, ideal));
  });

  function formatMs(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
    if (ms < 3_600_000) return `${(ms / 60_000).toFixed(2)}m`;
    return `${(ms / 3_600_000).toFixed(2)}h`;
  }

  const color = $derived(
    '#' +
      ((EVENT_COLORS[event.eventType] ?? EVENT_COLORS.default) >>> 0)
        .toString(16)
        .padStart(6, '0'),
  );

  const durationMs = $derived(event.endMs - event.startMs);
  const displayName = $derived(getEventDisplayName(event));
  const iconSvg = $derived(getEventIconSvg(event.eventType));
</script>

<div
  class="bg-gray-950/95 pointer-events-none absolute z-50 min-w-[200px] max-w-[280px] rounded-lg border border-white/10 p-3 shadow-2xl backdrop-blur-sm"
  style="left:{left}px; top:{top}px; width:{TOOLTIP_W}px"
>
  <div class="mb-2 flex items-center gap-2">
    <div
      class="h-4 w-4 shrink-0 rounded p-0.5"
      style="background:{color}25; color:{color}"
    >
      {#if iconSvg}
        {@html iconSvg}
      {:else}
        <div class="h-full w-full rounded-sm" style="background:{color}"></div>
      {/if}
    </div>
    <span class="truncate text-sm font-semibold text-white">{displayName}</span>
  </div>

  <div class="space-y-1">
    <div class="flex justify-between gap-4 text-xs">
      <span class="text-white/40">Duration</span>
      <span class="font-mono text-white/75">{formatMs(durationMs)}</span>
    </div>
    <div class="flex justify-between gap-4 text-xs">
      <span class="text-white/40">Status</span>
      <span class="font-mono capitalize text-white/75">{event.status}</span>
    </div>
    {#if event.eventId}
      <div class="flex justify-between gap-4 text-xs">
        <span class="text-white/40">Event ID</span>
        <span class="font-mono text-white/75">{event.eventId}</span>
      </div>
    {/if}
  </div>

  {#if Object.keys(event.attributes).length > 0}
    <div class="mt-2 border-t border-white/10 pt-2">
      {#each Object.entries(event.attributes).slice(0, 4) as [k, v] (k)}
        <div class="flex justify-between gap-4 text-xs">
          <span class="truncate text-white/30">{k}</span>
          <span class="max-w-[120px] truncate font-mono text-white/55"
            >{String(v)}</span
          >
        </div>
      {/each}
    </div>
  {/if}
</div>
