<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Timeline from '$lib/components/pixi-timeline/Timeline.svelte';
  import type { PixiRenderArgs } from '$lib/components/pixi-timeline/types';
  import type {
    BidirectionalProgress,
    BidirectionalStats,
  } from '$lib/services/fetch-bidirectional';
  import { fetchBidirectional } from '$lib/services/fetch-bidirectional';
  import {
    assignTrackIndices,
    getAscGroupCount,
    getDescGroupCount,
    getGroupCount,
    processEvent,
    reset as resetBuffer,
    setEstimatedGroupCount,
  } from '$lib/services/grouped-event-buffer';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { namespace, workflow: workflowId, run: runId } = $derived(page.params);

  type Phase = 'idle' | 'fetching' | 'done' | 'error';

  let phase = $state<Phase>('idle');
  let errorMsg = $state<string | null>(null);

  let progress = $state<BidirectionalProgress | null>(null);
  let fetchStats = $state<BidirectionalStats | null>(null);

  let fetchMs = $state<number | null>(null);
  let bufferTotalMs = $state<number | null>(null);
  let bufferGroupCount = $state<number | null>(null);
  let bufferAvgUsPerEvent = $state<number | null>(null);
  let heapDeltaMB = $state<number | null>(null);
  let eventCount = $state<number | null>(null);

  let controller: AbortController;

  const COLS = 40;
  let _frozenMeetCol = $state(COLS / 2);

  const total = $derived(
    fetchStats?.totalEvents ?? progress?.totalEstimated ?? 0,
  );
  const ascPct = $derived.by(() => {
    if (fetchStats)
      return (
        (fetchStats.ascPages / (fetchStats.ascPages + fetchStats.descPages)) *
        100
      );
    if (!progress || !total) return 0;
    return Math.min(100, (progress.ascMaxId / total) * 100);
  });
  const descPct = $derived.by(() => {
    if (fetchStats)
      return (
        (fetchStats.descPages / (fetchStats.ascPages + fetchStats.descPages)) *
        100
      );
    if (!progress || !total || !progress.descMinId) return 0;
    return Math.min(100, ((total - progress.descMinId + 1) / total) * 100);
  });
  const ascCols = $derived(Math.floor((ascPct / 100) * COLS));
  const descCols = $derived(Math.floor((descPct / 100) * COLS));

  function boxState(col: number): string {
    if (phase === 'done') return 'box-done';
    if (col < ascCols) return 'box-asc';
    if (col >= COLS - descCols) return 'box-desc';
    if (!progress) return 'box-idle';
    return 'box-empty';
  }

  type MemoryPerf = Performance & { memory: { usedJSHeapSize: number } };

  function heapNow(): number | null {
    return (
      (performance as unknown as MemoryPerf).memory?.usedJSHeapSize ?? null
    );
  }

  let estimatedGroups = $state(0);

  let pixiArgs = $state<PixiRenderArgs>({
    poolCount: 0,
    totalRows: 0,
    ascCount: 0,
    descCount: 0,
    finalized: false,
  });

  let _pixiRafId: number | null = null;
  function schedulePixiUpdate() {
    if (_pixiRafId !== null) return;
    _pixiRafId = requestAnimationFrame(() => {
      _pixiRafId = null;
      if (pixiArgs.finalized) return;
      pixiArgs = {
        poolCount: getGroupCount(),
        totalRows: estimatedGroups,
        ascCount: getAscGroupCount(),
        descCount: getDescGroupCount(),
        finalized: false,
      };
    });
  }

  function cancelScheduledUpdate() {
    if (_pixiRafId !== null) {
      cancelAnimationFrame(_pixiRafId);
      _pixiRafId = null;
    }
  }

  function run() {
    phase = 'fetching';
    errorMsg = null;
    progress = null;
    fetchStats = null;
    fetchMs = null;
    bufferTotalMs = null;
    bufferGroupCount = null;
    bufferAvgUsPerEvent = null;
    heapDeltaMB = null;
    eventCount = null;
    _frozenMeetCol = COLS / 2;
    controller?.abort();
    controller = new AbortController();

    const historySize =
      parseInt($workflowRun.workflow?.historyEvents ?? '0') || 0;
    resetBuffer(historySize);

    estimatedGroups = Math.max(0, Math.ceil(historySize / 2));
    setEstimatedGroupCount(estimatedGroups);

    pixiArgs = {
      poolCount: 0,
      totalRows: estimatedGroups,
      ascCount: 0,
      descCount: 0,
      finalized: false,
    };

    const heapBefore = heapNow();
    const t0 = performance.now();
    let bufferEventCount = 0;

    fetchBidirectional({
      namespace,
      workflowId,
      runId,
      signal: controller.signal,
      maximumPageSize: 1000,
      onProgress: (p) => {
        progress = p;
      },
      onRawPage: (events, isAscending) => {
        const t1 = performance.now();
        for (const event of events) {
          processEvent(event, isAscending);
        }
        bufferEventCount += events.length;
        bufferTotalMs = (bufferTotalMs ?? 0) + (performance.now() - t1);
        schedulePixiUpdate();
      },
    })
      .then((stats) => {
        fetchMs = performance.now() - t0;
        fetchStats = stats;
        eventCount = bufferEventCount;

        const asc = Math.floor(
          (stats.ascPages / (stats.ascPages + stats.descPages)) * COLS,
        );
        const desc = Math.floor(
          (stats.descPages / (stats.ascPages + stats.descPages)) * COLS,
        );
        _frozenMeetCol = Math.floor((asc + (COLS - desc)) / 2);

        bufferGroupCount = getGroupCount();
        bufferAvgUsPerEvent =
          bufferEventCount > 0 && bufferTotalMs !== null
            ? (bufferTotalMs / bufferEventCount) * 1000
            : 0;

        const heapAfter = heapNow();
        if (heapBefore !== null && heapAfter !== null) {
          heapDeltaMB = (heapAfter - heapBefore) / (1024 * 1024);
        }

        cancelScheduledUpdate();
        assignTrackIndices();
        phase = 'done';

        pixiArgs = {
          poolCount: getGroupCount(),
          totalRows: getGroupCount(),
          ascCount: getAscGroupCount(),
          descCount: getDescGroupCount(),
          finalized: true,
        };
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name !== 'AbortError') {
          errorMsg = e.message;
          phase = 'error';
        }
      });
  }

  onMount(() => {
    run();
    return () => {
      controller?.abort();
      if (_pixiRafId !== null) cancelAnimationFrame(_pixiRafId);
    };
  });

  const fmtMs = (ms: number) =>
    ms < 1
      ? `${(ms * 1000).toFixed(0)}µs`
      : ms < 1000
        ? `${Math.round(ms)}ms`
        : `${(ms / 1000).toFixed(2)}s`;

  const fmtUs = (us: number) =>
    us < 1000 ? `${us.toFixed(1)}µs` : `${(us / 1000).toFixed(2)}ms`;

  let statsCollapsed = $state(false);
</script>

<PageTitle title={`Fasterer | ${workflowId}`} url={page.url.href} />

<div class="flex h-[calc(100vh-3.5rem)] flex-col">
  <div class="bg-surface shrink-0 border-b border-subtle">
    <div class="flex items-center gap-4 px-4 py-2">
      <h2 class="text-lg font-semibold">⚡ Fasterer</h2>
      <p class="flex-1 text-sm text-secondary">
        Bidirectional fetch → Pixi renderer
      </p>
      <button
        class="rounded-md border border-subtle px-3 py-1 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        onclick={run}
        disabled={phase === 'fetching'}
      >
        Re-run
      </button>
      <button
        class="rounded-md px-2 py-1 text-xs text-secondary hover:bg-subtle"
        onclick={() => (statsCollapsed = !statsCollapsed)}
      >
        {statsCollapsed ? 'Show stats' : 'Hide stats'}
      </button>
    </div>

    {#if !statsCollapsed}
      <div class="px-4 pb-3">
        {#if errorMsg}
          <p class="mb-2 rounded-md bg-danger/10 px-4 py-2 text-sm text-danger">
            {errorMsg}
          </p>
        {/if}

        {#if phase === 'fetching'}
          <div
            class="progress-root mb-3"
            role="progressbar"
            aria-label="Bidirectional fetch progress"
            aria-valuenow={ascPct + descPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {#each { length: COLS } as _, col (col)}
              {@const state = boxState(col)}
              {@const isFrontierAsc = col === ascCols - 1 && ascCols > 0}
              {@const isFrontierDesc =
                col === COLS - descCols &&
                descCols > 0 &&
                COLS - descCols < COLS}
              <div
                class="box {state} {isFrontierAsc
                  ? 'frontier-asc'
                  : isFrontierDesc
                    ? 'frontier-desc'
                    : ''}"
              ></div>
            {/each}
          </div>
        {/if}

        {#if fetchStats !== null && fetchMs !== null}
          <div class="stats-grid">
            <div
              class="stat-card flex flex-col gap-2 rounded-lg border border-subtle p-3"
            >
              <h3
                class="text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Network
              </h3>
              <div class="flex flex-wrap gap-4">
                <div class="flex flex-col gap-0.5">
                  <span
                    class="font-mono text-xl font-bold tabular-nums text-primary"
                    >{fmtMs(fetchMs)}</span
                  >
                  <span class="text-xs text-secondary">total fetch</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span
                    class="font-mono text-xl font-bold tabular-nums text-primary"
                    >{fetchStats.totalEvents.toLocaleString()}</span
                  >
                  <span class="text-xs text-secondary">events</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span
                    class="font-mono text-xl font-bold tabular-nums text-primary"
                    >{fetchStats.eventsPerSecond.toLocaleString()}</span
                  >
                  <span class="text-xs text-secondary">ev/s</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-asc">↑ {fetchStats.ascPages}p</span>
                <span class="badge badge-desc">↓ {fetchStats.descPages}p</span>
                {#if fetchStats.overlap > 0}
                  <span class="badge">{fetchStats.overlap} overlap</span>
                {/if}
                <span class="badge badge-winner">{fetchStats.winner} won</span>
              </div>
            </div>

            {#if bufferTotalMs !== null}
              <div
                class="stat-card flex flex-col gap-2 rounded-lg border border-subtle p-3"
              >
                <h3
                  class="text-xs font-semibold uppercase tracking-wider text-secondary"
                >
                  Buffer
                </h3>
                <div class="flex flex-wrap gap-4">
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-mono text-xl font-bold tabular-nums text-primary"
                      >{fmtMs(bufferTotalMs)}</span
                    >
                    <span class="text-xs text-secondary">process</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-mono text-xl font-bold tabular-nums text-primary"
                    >
                      {bufferAvgUsPerEvent !== null
                        ? fmtUs(bufferAvgUsPerEvent)
                        : '—'}
                    </span>
                    <span class="text-xs text-secondary">avg/ev</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-mono text-xl font-bold tabular-nums text-primary"
                      >{bufferGroupCount?.toLocaleString()}</span
                    >
                    <span class="text-xs text-secondary">groups</span>
                  </div>
                </div>
              </div>
            {/if}

            <div
              class="stat-card flex flex-col gap-2 rounded-lg border border-subtle p-3"
              class:opacity-60={heapDeltaMB === null}
            >
              <h3
                class="text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Memory
              </h3>
              {#if heapDeltaMB !== null}
                <div class="flex flex-wrap gap-4">
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-mono text-xl font-bold tabular-nums"
                      class:text-primary={heapDeltaMB <= 50}
                      class:text-warning={heapDeltaMB > 50}
                    >
                      {heapDeltaMB > 0 ? '+' : ''}{heapDeltaMB.toFixed(1)} MB
                    </span>
                    <span class="text-xs text-secondary">heap Δ</span>
                  </div>
                  {#if eventCount && heapDeltaMB > 0}
                    <div class="flex flex-col gap-0.5">
                      <span
                        class="font-mono text-xl font-bold tabular-nums text-primary"
                      >
                        {((heapDeltaMB * 1024 * 1024) / eventCount).toFixed(0)} B
                      </span>
                      <span class="text-xs text-secondary">bytes/ev</span>
                    </div>
                  {/if}
                </div>
              {:else}
                <p class="text-xs text-secondary">Chrome only</p>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="bg-gray-950 min-h-0 flex-1">
    {#if pixiArgs.poolCount > 0 || phase === 'fetching'}
      <Timeline renderArgs={pixiArgs} class="h-full" />
    {:else if phase === 'idle'}
      <div class="flex h-full items-center justify-center text-secondary">
        <span class="text-sm">Waiting for data…</span>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .progress-root {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(40, 1fr);
    gap: 2px;
    height: 20px;
  }

  .box {
    border-radius: 2px;
  }

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

  .rendering-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 55%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in oklab, #6366f1 20%, transparent) 25%,
        color-mix(in oklab, #a855f7 45%, transparent) 50%,
        color-mix(in oklab, #6366f1 20%, transparent) 75%,
        transparent 100%
      );
      animation: rendering-wave 1.3s ease-in-out infinite;
      will-change: transform;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }

  .stat-card {
    background: color-mix(
      in oklab,
      var(--color-primary, #6366f1) 3%,
      transparent
    );
  }

  .badge {
    border-radius: 9999px;
    padding: 2px 8px;
    font-family: monospace;
    font-size: 0.7rem;
    background: color-mix(in oklab, currentColor 10%, transparent);
  }

  .badge-asc {
    color: var(--color-blue-500, #3b82f6);
    background: color-mix(
      in oklab,
      var(--color-blue-500, #3b82f6) 12%,
      transparent
    );
  }

  .badge-desc {
    color: var(--color-purple-500, #a855f7);
    background: color-mix(
      in oklab,
      var(--color-purple-500, #a855f7) 12%,
      transparent
    );
  }

  .badge-winner {
    color: var(--color-green-500, #22c55e);
    background: color-mix(
      in oklab,
      var(--color-green-500, #22c55e) 12%,
      transparent
    );
  }

  @keyframes rendering-wave {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(182%);
    }
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
