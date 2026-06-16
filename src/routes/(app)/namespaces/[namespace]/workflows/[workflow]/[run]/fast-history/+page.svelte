<svelte:options runes />

<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import {
    type BidirectionalProgress,
    type BidirectionalStats,
    fetchAllEventsBidirectional,
  } from '$lib/services/events-service';

  const { namespace, workflow: workflowId, run: runId } = $derived(page.params);

  let progress = $state<BidirectionalProgress | null>(null);
  let stats = $state<BidirectionalStats | null>(null);
  let error = $state<string | null>(null);
  let pageSize = $state(1000);
  let controller: AbortController;

  function start() {
    progress = null;
    stats = null;
    error = null;
    controller?.abort();
    controller = new AbortController();

    fetchAllEventsBidirectional({
      namespace,
      workflowId,
      runId,
      signal: controller.signal,
      maximumPageSize: pageSize,
      onProgress: (p) => {
        progress = p;
      },
    })
      .then(({ stats: s }) => {
        stats = s;
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

  const gapPct = $derived(Math.max(0, 100 - ascPct - descPct));
  const done = $derived(stats !== null);
</script>

<div class="flex flex-col gap-6 p-6">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold">Bidirectional Fetch</h2>
      <p class="mt-1 text-sm text-secondary">
        Ascending + descending pages run in parallel and stop when they meet in
        the middle.
      </p>
    </div>
    <div class="flex items-center gap-2">
      <label for="page-size" class="text-sm text-secondary">Page size</label>
      <select
        id="page-size"
        class="bg-surface-primary rounded border border-subtle px-2 py-1 text-sm"
        bind:value={pageSize}
        onchange={start}
        disabled={!!progress && !stats}
      >
        <option value={100}>100</option>
        <option value={200}>200</option>
        <option value={500}>500</option>
        <option value={750}>750</option>
        <option value={1000}>1000</option>
      </select>
    </div>
  </div>

  {#if error}
    <div
      class="rounded border border-danger bg-danger/10 p-4 text-sm text-danger"
    >
      {error}
    </div>
  {:else}
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between text-xs text-secondary">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          Ascending
          {#if progress || stats}
            · {fmt(stats?.ascPages ?? progress?.ascPages ?? 0)}p
          {/if}
        </span>
        <span class="tabular-nums">
          {#if done}
            {fmtMs(stats.durationMs)} · {fmt(stats.totalEvents)} events
          {:else if progress}
            {fmtMs(progress.elapsedMs)}
          {:else}
            Starting…
          {/if}
        </span>
        <span class="flex items-center gap-1.5">
          {#if progress || stats}
            {fmt(stats?.descPages ?? progress?.descPages ?? 0)}p ·
          {/if}
          Descending
          <span class="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
        </span>
      </div>

      <div
        class="relative h-10 w-full overflow-hidden rounded-lg bg-subtle"
        role="progressbar"
        aria-label="Bidirectional fetch progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ascPct + descPct}
      >
        {#if !progress && !stats}
          <div
            class="absolute inset-0 animate-pulse rounded-lg bg-primary/20"
          ></div>
        {:else if done}
          <div class="absolute inset-0 flex">
            <div
              class="h-full bg-blue-500 transition-[width] duration-500 ease-out"
              style="width:{ascPct}%"
            ></div>
            <div
              class="h-full flex-1 bg-green-500 transition-colors duration-500"
            ></div>
            <div
              class="h-full bg-purple-500 transition-[width] duration-500 ease-out"
              style="width:{descPct}%"
            ></div>
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white"
          >
            {fmt(stats.eventsPerSecond)}/s · winner: {stats.winner}
          </div>
        {:else}
          <div class="absolute inset-0 flex">
            <div
              class="h-full bg-blue-500 transition-[width] duration-300 ease-out"
              style="width:{ascPct}%"
            ></div>
            <div class="h-full flex-1"></div>
            <div
              class="h-full bg-purple-500 transition-[width] duration-300 ease-out"
              style="width:{descPct}%"
            ></div>
          </div>
          {#if total && gapPct > 2}
            <div
              class="absolute inset-0 flex items-center justify-center text-xs font-medium text-secondary"
            >
              {fmt(Math.round((gapPct * total) / 100))} remaining
            </div>
          {/if}
        {/if}
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
    </div>

    {#if done}
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="bg-surface-primary rounded border border-subtle p-4">
          <p class="text-xs text-secondary">Total time</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">
            {fmtMs(stats.durationMs)}
          </p>
        </div>
        <div class="bg-surface-primary rounded border border-subtle p-4">
          <p class="text-xs text-secondary">Events loaded</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">
            {fmt(stats.totalEvents)}
          </p>
        </div>
        <div class="bg-surface-primary rounded border border-subtle p-4">
          <p class="text-xs text-secondary">Throughput</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">
            {fmt(stats.eventsPerSecond)}<span
              class="text-sm font-normal text-secondary">/s</span
            >
          </p>
        </div>
        <div class="bg-surface-primary rounded border border-subtle p-4">
          <p class="text-xs text-secondary">Ascending pages</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">{stats.ascPages}</p>
        </div>
        <div class="bg-surface-primary rounded border border-subtle p-4">
          <p class="text-xs text-secondary">Descending pages</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">{stats.descPages}</p>
        </div>
        <div class="bg-surface-primary rounded border border-subtle p-4">
          <p class="text-xs text-secondary">Winner</p>
          <p class="mt-1 text-2xl font-bold capitalize tabular-nums">
            {stats.winner}
          </p>
        </div>
      </div>

      <div
        class="bg-surface-primary rounded border border-subtle p-4 font-mono text-sm"
      >
        <div class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          <span class="text-secondary">total_events</span><span
            >{fmt(stats.totalEvents)}</span
          >
          <span class="text-secondary">duration_ms</span><span
            >{Math.round(stats.durationMs)}</span
          >
          <span class="text-secondary">events_per_sec</span><span
            >{fmt(stats.eventsPerSecond)}</span
          >
          <span class="text-secondary">asc_pages</span><span
            >{stats.ascPages}</span
          >
          <span class="text-secondary">desc_pages</span><span
            >{stats.descPages}</span
          >
          <span class="text-secondary">total_pages</span><span
            >{stats.ascPages + stats.descPages}</span
          >
          <span class="text-secondary">winner</span><span>{stats.winner}</span>
          {#if stats.overlap > 0}
            <span class="text-secondary">overlap_deduped</span><span
              class="text-warning">{fmt(stats.overlap)}</span
            >
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>
