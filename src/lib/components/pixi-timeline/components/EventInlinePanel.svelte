<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import { EVENT_COLORS } from '../eventColors';
  import { formatDuration, getEventDisplayName } from '../eventUtils';
  import { getEventIconSvg } from '../renderer/icon-svgs';
  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';
  import type { TemporalEvent } from '../types';

  const _ctx = getContext<TimelineCtx>(TIMELINE_CTX);
  const deselectEvent = (id: string) => _ctx.deselectEvent(id);

  interface Props {
    event: TemporalEvent;
  }

  let { event }: Props = $props();

  const color = $derived(
    '#' +
      ((EVENT_COLORS[event.eventType] ?? EVENT_COLORS.default) >>> 0)
        .toString(16)
        .padStart(6, '0'),
  );

  const displayName = $derived(getEventDisplayName(event));
  const iconSvg = $derived(getEventIconSvg(event.eventType));

  const categoryLabel = $derived.by(() => {
    const t = event.eventType;
    if (t === 'GROUP_ACTIVITY') return 'Activity';
    if (t === 'GROUP_TIMER') return 'Timer';
    if (t === 'GROUP_CHILD_WORKFLOW') return 'Child Workflow';
    if (t === 'GROUP_WORKFLOW_TASK') return 'Workflow Task';
    return t
      .replace('EVENT_TYPE_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  });

  const durationMs = $derived(event.endMs - event.startMs);

  const statusColor = $derived.by(() => {
    const s = event.status;
    if (s === 'completed') return '#4ade80';
    if (s === 'failed') return '#f87171';
    if (s === 'canceled') return '#fb923c';
    if (s === 'started') return '#60a5fa';
    if (s === 'scheduled') return '#94a3b8';
    if (s === 'fired') return '#facc15';
    if (s === 'signaled') return '#22d3ee';
    return '#94a3b8';
  });

  function formatRelativeMs(ms: number): string {
    if (ms < 0) return `${ms}ms`;
    if (ms < 1_000) return `+${ms.toFixed(0)}ms`;
    if (ms < 60_000) return `+${(ms / 1_000).toFixed(2)}s`;
    if (ms < 3_600_000) return `+${(ms / 60_000).toFixed(1)}m`;
    return `+${(ms / 3_600_000).toFixed(1)}h`;
  }

  const historyHref = $derived.by(() => {
    if (!event.eventId || event.eventId.startsWith('demo-')) return null;
    const { namespace, workflow, run } = page.params;
    return `/namespaces/${namespace}/workflows/${workflow}/${run}/history/${event.eventId}`;
  });

  const allAttrs = $derived(
    Object.entries(event.attributes).filter(([k]) => k !== 'type'),
  );

  let expanded = $state(false);
</script>

<div
  class="bg-gray-950/95 absolute right-0 top-0 z-30 flex h-full w-72 flex-col overflow-hidden rounded-l-lg border-l border-white/10 shadow-2xl backdrop-blur-sm"
>
  <!-- Header -->
  <div class="flex shrink-0 items-center gap-2.5 border-b border-white/10 p-3">
    <div
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded p-1.5"
      style="background:{color}20; color:{color}"
    >
      {#if iconSvg}
        {@html iconSvg}
      {:else}
        <span class="text-[11px] font-bold">
          {event.eventType.replace(/^(EVENT_TYPE_|GROUP_)/, '')[0]}
        </span>
      {/if}
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-white">{displayName}</p>
      <p class="text-[11px] text-white/40">{categoryLabel}</p>
    </div>
    <button
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white"
      onclick={() => deselectEvent(event.eventId ?? '')}
      aria-label="Close panel"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M1 1l8 8M9 1L1 9"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>

  <!-- Body -->
  <div class="flex-1 overflow-y-auto p-3">
    <!-- Status badge -->
    <div class="mb-3 flex items-center gap-2">
      <span
        class="rounded px-2 py-0.5 text-[11px] font-medium capitalize"
        style="background:{statusColor}22; color:{statusColor}"
      >
        {event.status}
      </span>
      {#if historyHref}
        <a
          href={historyHref}
          class="rounded bg-white/5 px-2 py-0.5 text-[11px] text-white/40 hover:bg-white/10 hover:text-white/70"
        >
          #{event.eventId}
        </a>
      {/if}
    </div>

    <!-- Time / duration grid -->
    <div class="mb-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
      <div>
        <p class="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">
          Start
        </p>
        <p class="font-mono text-white/70">{formatRelativeMs(event.startMs)}</p>
      </div>
      <div>
        <p class="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">
          Duration
        </p>
        <p class="font-mono text-white/70">{formatDuration(durationMs)}</p>
      </div>
      {#if event.endMs > event.startMs}
        <div>
          <p class="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">
            End
          </p>
          <p class="font-mono text-white/70">{formatRelativeMs(event.endMs)}</p>
        </div>
      {/if}
      <div>
        <p class="mb-0.5 text-[10px] uppercase tracking-wide text-white/30">
          Track
        </p>
        <p class="font-mono text-white/70">{event.trackIndex}</p>
      </div>
    </div>

    <!-- Divider -->
    {#if allAttrs.length > 0}
      <div class="mb-2 border-t border-white/5"></div>

      <button
        class="mb-1.5 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60"
        onclick={() => (expanded = !expanded)}
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          class="transition-transform {expanded ? 'rotate-90' : ''}"
        >
          <path
            d="M2.5 1.5l5 3.5-5 3.5"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
        Attributes ({allAttrs.length})
      </button>

      {#if expanded}
        <div class="space-y-1.5 rounded bg-white/5 p-2">
          {#each allAttrs as [k, v] (k)}
            <div>
              <p class="text-[10px] text-white/30">{k}</p>
              <p class="break-all font-mono text-[11px] text-white/60">
                {String(v)}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
