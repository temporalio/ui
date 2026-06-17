<svelte:options runes />

<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import WorkflowTimelineLayout from '$lib/layouts/workflow-timeline-layout.svelte';
  import {
    type BidirectionalProgress,
    type BidirectionalStats,
    fetchAllEventsBidirectional,
  } from '$lib/services/events-service';
  import { fullEventHistory } from '$lib/stores/events';

  const { namespace, workflow: workflowId, run: runId } = $derived(page.params);

  let progress = $state<BidirectionalProgress | null>(null);
  let stats = $state<BidirectionalStats | null>(null);
  let error = $state<string | null>(null);
  let showTimeline = $state(false);
  let controller: AbortController;

  export { stats, progress };

  function start() {
    progress = null;
    stats = null;
    error = null;
    showTimeline = false;
    controller?.abort();
    controller = new AbortController();

    fetchAllEventsBidirectional({
      namespace,
      workflowId,
      runId,
      signal: controller.signal,
      maximumPageSize: 1000,
      onProgress: (p) => {
        progress = p;
      },
    })
      .then(({ events, stats: s }) => {
        stats = s;
        fullEventHistory.set(events);
        const waveMs = Math.floor((COLS / 2) * 18) + 400;
        setTimeout(() => {
          showTimeline = true;
        }, waveMs);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name !== 'AbortError') {
          error = e.message;
        }
      });
  }

  onMount(() => {
    start();
    return () => controller.abort();
  });

  const fmt = (n: number) => n.toLocaleString();
  const fmtMs = (ms: number) =>
    ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;

  const total = $derived(stats?.totalEvents ?? progress?.totalEstimated ?? 0);
  const done = $derived(stats !== null);

  const COLS = 40;
  const ROWS = 10;

  const ascPct = $derived.by(() => {
    if (stats)
      return (stats.ascPages / (stats.ascPages + stats.descPages)) * 100;
    if (!progress || !total) return 0;
    return Math.min(100, (progress.ascMaxId / total) * 100);
  });

  const descPct = $derived.by(() => {
    if (stats)
      return (stats.descPages / (stats.ascPages + stats.descPages)) * 100;
    if (!progress || !total || !progress.descMinId) return 0;
    return Math.min(100, ((total - progress.descMinId + 1) / total) * 100);
  });

  const ascCols = $derived(done ? COLS : Math.floor((ascPct / 100) * COLS));
  const descCols = $derived(done ? COLS : Math.floor((descPct / 100) * COLS));

  function boxState(col: number) {
    if (done) return 'done';
    if (col < ascCols) return 'asc';
    if (col >= COLS - descCols) return 'desc';
    return 'empty';
  }

  const meetCol = $derived(Math.floor((ascCols + (COLS - descCols)) / 2));
</script>

{#if showTimeline}
  <WorkflowTimelineLayout />
{:else}
  <div class="flex h-[60dvh] flex-col justify-center gap-3 px-6">
    {#if error}
      <p class="text-sm text-danger">{error}</p>
    {:else}
      <div class="flex items-center justify-between text-xs text-secondary">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          Ascending
          {#if progress || stats}· {fmt(
              stats?.ascPages ?? progress?.ascPages ?? 0,
            )}p{/if}
        </span>
        <span class="tabular-nums">
          {#if done}
            {fmtMs(stats.durationMs)} · {fmt(stats.totalEvents)} events · {fmt(
              stats.eventsPerSecond,
            )}/s
          {:else if progress}
            {fmtMs(progress.elapsedMs)} · {fmt(
              progress.ascEvents + progress.descEvents,
            )} events
          {:else}
            Starting…
          {/if}
        </span>
        <span class="flex items-center gap-1.5">
          {#if progress || stats}{fmt(
              stats?.descPages ?? progress?.descPages ?? 0,
            )}p ·{/if}
          Descending
          <span class="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
        </span>
      </div>

      <div
        class="grid flex-1 gap-0.5 {!progress && !done ? 'breathe' : ''}"
        style="grid-template-columns: repeat({COLS}, 1fr); grid-template-rows: repeat({ROWS}, 1fr); contain: layout style paint;"
        role="progressbar"
        aria-label="Bidirectional fetch progress"
        aria-valuenow={ascPct + descPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {#each { length: ROWS } as _, row}
          {#each { length: COLS } as _, col}
            {@const state = boxState(col)}
            {@const isFrontierAsc = !done && col === ascCols - 1}
            {@const isFrontierDesc = !done && col === COLS - descCols}
            {@const doneDelay = Math.abs(col - meetCol) * 18}
            <div
              class="box rounded-sm {state === 'asc'
                ? 'box-asc'
                : state === 'desc'
                  ? 'box-desc'
                  : state === 'done'
                    ? 'box-done'
                    : !progress
                      ? 'box-idle'
                      : 'box-empty'} {isFrontierAsc
                ? 'frontier-asc'
                : isFrontierDesc
                  ? 'frontier-desc'
                  : ''}"
              style={state === 'done' ? `animation-delay: ${doneDelay}ms` : ''}
            ></div>
          {/each}
        {/each}
      </div>

      {#if total}
        <div class="relative flex justify-between text-xs text-secondary">
          <span>1</span>
          {#if !done && progress?.ascMaxId && progress?.descMinId}
            <span
              class="absolute font-medium text-blue-500"
              style="left:{ascPct}%;transform:translateX(-50%)"
            >
              {fmt(progress.ascMaxId)} ↑
            </span>
            <span
              class="absolute font-medium text-purple-500"
              style="right:{descPct}%;transform:translateX(50%)"
            >
              ↓ {fmt(progress.descMinId)}
            </span>
          {/if}
          <span>{fmt(total)}</span>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .box-idle {
    background-color: color-mix(
      in oklab,
      var(--color-primary, #6366f1) 8%,
      transparent
    );
  }

  .box-empty {
    background-color: color-mix(in oklab, currentColor 10%, transparent);
  }

  .box-asc {
    background-color: var(--color-blue-500, #3b82f6);
    animation: pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .box-desc {
    background-color: var(--color-purple-500, #a855f7);
    animation: pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .box-done {
    background-color: var(--color-green-500, #22c55e);
    animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .frontier-asc {
    animation: pulseBlue 0.9s ease-in-out infinite;
    will-change: filter;
  }

  .frontier-desc {
    animation: pulsePurple 0.9s ease-in-out infinite;
    will-change: filter;
  }

  .breathe {
    animation: breathe 2.5s ease-in-out infinite;
  }

  @keyframes pop {
    0% {
      transform: scale(0.55);
      opacity: 0.6;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes breathe {
    0%,
    100% {
      opacity: 0.3;
    }

    50% {
      opacity: 0.7;
    }
  }

  @keyframes pulseBlue {
    0%,
    100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(1.6) saturate(1.2);
    }
  }

  @keyframes pulsePurple {
    0%,
    100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(1.6) saturate(1.2);
    }
  }
</style>
