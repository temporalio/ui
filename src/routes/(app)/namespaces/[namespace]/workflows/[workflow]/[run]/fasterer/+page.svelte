<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    type BidirectionalProgress,
    type BidirectionalStats,
    fetchBidirectional,
  } from '$lib/services/fetch-bidirectional';
  import {
    getGroupCount,
    getRows,
    processEvent,
    reset as resetBuffer,
  } from '$lib/services/grouped-event-buffer';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { HistoryEvent } from '$lib/types/events';

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
  let frozenMeetCol = $state(COLS / 2);

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

  const ROW_LIMIT = 1000;
  // undefined = not yet resolved, null = resolved but filtered (WFT), EventGroup = real row
  let rows = $state<(EventGroup | null | undefined)[]>([]);
  let rowsResolved = $state(0);

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
    frozenMeetCol = COLS / 2;
    controller?.abort();
    controller = new AbortController();

    // Pre-allocate the buffer using historyEvents count from the workflow
    // metadata so the first processEvent calls never need to grow the arrays.
    const estimatedSize =
      parseInt($workflowRun.workflow?.historyEvents ?? '0') || 0;
    resetBuffer(estimatedSize);

    // Request the first 1000 rows RIGHT NOW before any data has arrived.
    // Each Promise is registered in pendingResolvers and will resolve the
    // moment processEvent() completes its group — data streams in live.
    rows = new Array<EventGroup | null | undefined>(ROW_LIMIT).fill(undefined);
    rowsResolved = 0;
    const promises = getRows(0, ROW_LIMIT, { excludeWorkflowTasks: true });
    promises.forEach((p, i) => {
      p.then((group) => {
        rows[i] = group ?? null;
        rowsResolved += 1;
      });
    });

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
        frozenMeetCol = Math.floor((asc + (COLS - desc)) / 2);

        bufferGroupCount = getGroupCount();
        bufferAvgUsPerEvent =
          bufferEventCount > 0 && bufferTotalMs !== null
            ? (bufferTotalMs / bufferEventCount) * 1000
            : 0;

        const heapAfter = heapNow();
        if (heapBefore !== null && heapAfter !== null) {
          heapDeltaMB = (heapAfter - heapBefore) / (1024 * 1024);
        }

        phase = 'done';

        // Trim rows to actual group count (may be less than ROW_LIMIT)
        const actual = getGroupCount();
        if (actual < ROW_LIMIT) rows = rows.slice(0, actual);
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
    return () => controller?.abort();
  });

  const fmtMs = (ms: number) =>
    ms < 1
      ? `${(ms * 1000).toFixed(0)}µs`
      : ms < 1000
        ? `${Math.round(ms)}ms`
        : `${(ms / 1000).toFixed(2)}s`;

  const fmtUs = (us: number) =>
    us < 1000 ? `${us.toFixed(1)}µs` : `${(us / 1000).toFixed(2)}ms`;
</script>

<PageTitle title={`Fasterer | ${workflowId}`} url={page.url.href} />

<div class="flex flex-col gap-6 py-4">
  <div class="flex items-center gap-4">
    <h2 class="text-xl font-semibold">⚡ Fasterer</h2>
    <p class="flex-1 text-sm text-secondary">
      Bidirectional fetch → grouped-event-buffer
    </p>
    <button
      class="rounded-md border border-subtle px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
      onclick={run}
      disabled={phase === 'fetching'}
    >
      Re-run
    </button>
  </div>

  {#if errorMsg}
    <p class="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
      {errorMsg}
    </p>
  {/if}

  {#if phase !== 'idle'}
    <div
      class="progress-root"
      role="progressbar"
      aria-label="Bidirectional fetch progress"
      aria-valuenow={ascPct + descPct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {#if phase === 'done'}
        <div class="rendering-overlay" aria-hidden="true"></div>
      {/if}
      {#each { length: COLS } as _, col}
        {@const state = boxState(col)}
        {@const isFrontierAsc =
          phase === 'fetching' && col === ascCols - 1 && ascCols > 0}
        {@const isFrontierDesc =
          phase === 'fetching' &&
          col === COLS - descCols &&
          descCols > 0 &&
          COLS - descCols < COLS}
        {@const delay =
          phase === 'done' ? Math.abs(col - frozenMeetCol) * 18 : 0}
        <div
          class="box {state} {isFrontierAsc
            ? 'frontier-asc'
            : isFrontierDesc
              ? 'frontier-desc'
              : ''}"
          style={phase === 'done' ? `animation-delay: ${delay}ms` : undefined}
        ></div>
      {/each}
    </div>
  {/if}

  {#if fetchStats !== null && fetchMs !== null}
    <div class="stats-grid">
      <div
        class="stat-card flex flex-col gap-3 rounded-xl border border-subtle p-5"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-wider text-secondary"
        >
          Network
        </h3>
        <div class="flex flex-wrap gap-5">
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-2xl font-bold tabular-nums text-primary"
              >{fmtMs(fetchMs)}</span
            >
            <span class="text-xs text-secondary">total fetch</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-2xl font-bold tabular-nums text-primary"
              >{fetchStats.totalEvents.toLocaleString()}</span
            >
            <span class="text-xs text-secondary">events</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-2xl font-bold tabular-nums text-primary"
              >{fetchStats.eventsPerSecond.toLocaleString()}</span
            >
            <span class="text-xs text-secondary">events / sec</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="badge badge-asc">↑ {fetchStats.ascPages} pages</span>
          <span class="badge badge-desc">↓ {fetchStats.descPages} pages</span>
          {#if fetchStats.overlap > 0}
            <span class="badge">{fetchStats.overlap} overlap</span>
          {/if}
          <span class="badge badge-winner">{fetchStats.winner} won</span>
        </div>
      </div>

      {#if bufferTotalMs !== null}
        <div
          class="stat-card flex flex-col gap-3 rounded-xl border border-subtle p-5"
        >
          <h3
            class="text-xs font-semibold uppercase tracking-wider text-secondary"
          >
            Buffer
          </h3>
          <div class="flex flex-wrap gap-5">
            <div class="flex flex-col gap-0.5">
              <span
                class="font-mono text-2xl font-bold tabular-nums text-primary"
                >{fmtMs(bufferTotalMs)}</span
              >
              <span class="text-xs text-secondary">total process</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span
                class="font-mono text-2xl font-bold tabular-nums text-primary"
              >
                {bufferAvgUsPerEvent !== null
                  ? fmtUs(bufferAvgUsPerEvent)
                  : '—'}
              </span>
              <span class="text-xs text-secondary">avg / event</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span
                class="font-mono text-2xl font-bold tabular-nums text-primary"
                >{bufferGroupCount?.toLocaleString()}</span
              >
              <span class="text-xs text-secondary">groups</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            {#if eventCount && bufferGroupCount}
              <span class="badge"
                >{(eventCount / bufferGroupCount).toFixed(1)} events / group avg</span
              >
            {/if}
            {#if eventCount && bufferTotalMs}
              <span class="badge"
                >{Math.round(
                  eventCount / (bufferTotalMs / 1000),
                ).toLocaleString()} ev/s throughput</span
              >
            {/if}
          </div>
        </div>
      {/if}

      <div
        class="stat-card flex flex-col gap-3 rounded-xl border border-subtle p-5"
        class:opacity-60={heapDeltaMB === null}
      >
        <h3
          class="text-xs font-semibold uppercase tracking-wider text-secondary"
        >
          Memory
        </h3>
        {#if heapDeltaMB !== null}
          <div class="flex flex-wrap gap-5">
            <div class="flex flex-col gap-0.5">
              <span
                class="font-mono text-2xl font-bold tabular-nums"
                class:text-primary={heapDeltaMB <= 50}
                class:text-warning={heapDeltaMB > 50}
              >
                {heapDeltaMB > 0 ? '+' : ''}{heapDeltaMB.toFixed(1)} MB
              </span>
              <span class="text-xs text-secondary">heap Δ (buffer pass)</span>
            </div>
            {#if eventCount && heapDeltaMB > 0}
              <div class="flex flex-col gap-0.5">
                <span
                  class="font-mono text-2xl font-bold tabular-nums text-primary"
                >
                  {((heapDeltaMB * 1024 * 1024) / eventCount).toFixed(0)} B
                </span>
                <span class="text-xs text-secondary">bytes / event</span>
              </div>
            {/if}
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="badge">Chrome performance.memory</span>
          </div>
        {:else}
          <p class="text-sm text-secondary">
            Not available — use Chrome for heap stats
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if rows.length > 0}
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold">
          First {rows.length} groups
          <span class="font-normal text-secondary"
            >(workflow tasks excluded)</span
          >
        </h3>
        <span class="font-mono text-xs text-secondary"
          >{rowsResolved} / {rows.length} resolved</span
        >
      </div>
      <div
        class="rows-table overflow-x-auto rounded-xl border border-subtle"
        role="table"
        aria-label="Event groups"
      >
        <div
          class="rows-thead surface-background border-b border-subtle px-3 py-2 font-semibold uppercase tracking-wider text-secondary"
          role="row"
        >
          <span role="columnheader">#</span>
          <span role="columnheader">name</span>
          <span role="columnheader">classification</span>
          <span role="columnheader">events</span>
          <span role="columnheader">timestamp</span>
        </div>
        {#each rows as group, i}
          {#if group === undefined}
            <div
              class="row border-b border-subtle px-3 py-1.5 font-mono text-secondary opacity-40 last:border-0"
              role="row"
            >
              <span role="cell">{i + 1}</span>
              <span role="cell">resolving…</span>
            </div>
          {:else if group !== null}
            <div
              class="row border-b border-subtle px-3 py-1.5 font-mono transition-colors last:border-0"
              class:text-danger={group.isFailureOrTimedOut}
              class:text-warning={group.isCanceled}
              class:italic={group.isPending}
              role="row"
            >
              <span class="text-secondary" role="cell">{i + 1}</span>
              <span
                class="overflow-hidden text-ellipsis whitespace-nowrap"
                role="cell"
                >{group.displayName || group.name || group.label || '—'}</span
              >
              <span class="text-secondary" role="cell"
                >{group.finalClassification ?? '—'}</span
              >
              <span class="text-right text-secondary" role="cell"
                >{group.eventList.length}</span
              >
              <span
                class="overflow-hidden text-ellipsis whitespace-nowrap text-secondary"
                role="cell">{group.timestamp ?? '—'}</span
              >
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  /* Progress bar */
  .progress-root {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(40, 1fr);
    gap: 2px;
    height: 24px;
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

  /* Stats cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
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
    font-size: 0.75rem;
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

  /* Rows table */
  .rows-table {
    font-size: 0.78rem;
  }

  .rows-thead {
    display: grid;
    grid-template-columns: 3rem 1fr 10rem 4rem 12rem;
    gap: 8px;
  }

  .row {
    display: grid;
    grid-template-columns: 3rem 1fr 10rem 4rem 12rem;
    gap: 8px;
    animation: rowIn 0.12s ease-out both;
  }

  /* Animations */
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

  @keyframes rowIn {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
